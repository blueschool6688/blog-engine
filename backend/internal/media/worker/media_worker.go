package worker

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"backend/internal/media/repository"
	"backend/pkg/logger"
	"backend/pkg/storage"
)

type MediaWorker struct {
	repo       *repository.MediaRepository
	logger     *logger.Logger
	storage    storage.Storage
	imageQueue chan uint
	videoQueue chan uint
}

func NewMediaWorker(
	repo *repository.MediaRepository,
	log *logger.Logger,
	store storage.Storage,
	imageQueue chan uint,
	videoQueue chan uint,
) *MediaWorker {
	return &MediaWorker{
		repo:       repo,
		logger:     log,
		storage:    store,
		imageQueue: imageQueue,
		videoQueue: videoQueue,
	}
}

func (w *MediaWorker) Start(ctx context.Context) {
	w.logger.Info("Starting Media Worker...")

	// Image worker loop
	go func() {
		for {
			select {
			case <-ctx.Done():
				w.logger.Info("Stopping Image Worker...")
				return
			case id := <-w.imageQueue:
				w.logger.Info("Processing image ID: %d", id)
				w.processImage(ctx, id)
			}
		}
	}()

	// Video worker loop
	go func() {
		for {
			select {
			case <-ctx.Done():
				w.logger.Info("Stopping Video Worker...")
				return
			case id := <-w.videoQueue:
				w.logger.Info("Processing video ID: %d", id)
				w.processVideo(ctx, id)
			}
		}
	}()
}

// processImage: tải ảnh từ storage hiện tại, set thumbnail bằng original image
func (w *MediaWorker) processImage(ctx context.Context, id uint) {
	time.Sleep(3 * time.Second)

	media, err := w.repo.FindByID(ctx, id)
	if err != nil {
		w.logger.Error("processImage: find media %d: %v", id, err)
		return
	}

	if media.StorageKey == "" {
		w.logger.Error("processImage: media %d has no storage_key, skipping", id)
		media.Status = "completed"
		w.repo.Update(ctx, media)
		return
	}

	// Download file gốc từ storage hiện tại
	reader, err := w.storage.DownloadFile(ctx, media.StorageKey)
	if err != nil {
		w.logger.Error("processImage: download media %d: %v", id, err)
		media.ThumbnailURL = media.URL
		media.ThumbnailStorageKey = media.StorageKey
		media.Status = "completed"
		w.repo.Update(ctx, media)
		return
	}
	defer reader.Close()

	// Tạo thumbnail trong memory
	thumbBuf, format, err := createThumbnailInMemory(reader, 300)
	if err != nil {
		w.logger.Error("processImage: create thumbnail for media %d: %v. Fallback to original.", id, err)
		media.ThumbnailURL = media.URL
		media.ThumbnailStorageKey = media.StorageKey
		media.Status = "completed"
		w.repo.Update(ctx, media)
		return
	}

	// Xác định key và type cho thumbnail
	thumbContentType := "image/jpeg"
	if format == "png" {
		thumbContentType = "image/png"
	}
	thumbKey := storage.BuildThumbnailKey(media.StorageKey)

	// Upload thumbnail lên storage
	if err := w.storage.UploadFile(ctx, thumbKey, bytes.NewReader(thumbBuf), thumbContentType); err != nil {
		w.logger.Error("processImage: upload thumbnail for media %d: %v. Fallback to original.", id, err)
		media.ThumbnailURL = media.URL
		media.ThumbnailStorageKey = media.StorageKey
	} else {
		media.ThumbnailURL = w.storage.GetPublicURL(thumbKey)
		media.ThumbnailStorageKey = thumbKey
	}

	media.Status = "completed"

	if err := w.repo.Update(ctx, media); err != nil {
		w.logger.Error("processImage: update media %d: %v", id, err)
	} else {
		w.logger.Info("processImage: successfully processed media ID %d", id)
	}
}

// processVideo: tải video về file tạm để FFmpeg xử lý, trích xuất poster frame, upload poster lên storage.
func (w *MediaWorker) processVideo(ctx context.Context, id uint) {
	time.Sleep(3 * time.Second)

	media, err := w.repo.FindByID(ctx, id)
	if err != nil {
		w.logger.Error("processVideo: find media %d: %v", id, err)
		return
	}

	if media.StorageKey == "" {
		w.logger.Error("processVideo: media %d has no storage_key, skipping", id)
		media.Status = "completed"
		w.repo.Update(ctx, media)
		return
	}

	// Tạo video file tạm cho FFmpeg
	tmpFile, err := os.CreateTemp("", fmt.Sprintf("video_%d_*%s", id, filepath.Ext(media.StorageKey)))
	if err != nil {
		w.logger.Error("processVideo: create temp file for media %d: %v", id, err)
		media.Status = "failed"
		w.repo.Update(ctx, media)
		return
	}
	tmpPath := tmpFile.Name()
	defer os.Remove(tmpPath)

	videoReader, err := w.storage.DownloadFile(ctx, media.StorageKey)
	if err != nil {
		w.logger.Error("processVideo: download from storage for media %d: %v", id, err)
		media.Status = "failed"
		w.repo.Update(ctx, media)
		return
	}
	defer videoReader.Close()

	if _, err := io.Copy(tmpFile, videoReader); err != nil {
		tmpFile.Close()
		w.logger.Error("processVideo: write temp file for media %d: %v", id, err)
		media.Status = "failed"
		w.repo.Update(ctx, media)
		return
	}
	tmpFile.Close()

	media.ThumbnailURL = media.URL
	media.ThumbnailStorageKey = media.StorageKey
	media.Status = "completed"

	// Trích xuất metadata (duration, resolution)
	duration, resolution, _ := parseVideoMetadata(tmpPath)
	media.Duration = duration
	media.Resolution = resolution

	if err := w.repo.Update(ctx, media); err != nil {
		w.logger.Error("processVideo: update media %d: %v", id, err)
	} else {
		w.logger.Info("processVideo: successfully processed video ID %d", id)
	}
}

// ── helpers ──────────────────────────────────────────────────────────────────

func createThumbnailInMemory(r io.Reader, maxWidth int) ([]byte, string, error) {
	src, format, err := image.Decode(r)
	if err != nil {
		return nil, "", fmt.Errorf("decode image: %w", err)
	}

	bounds := src.Bounds()
	srcW := bounds.Dx()
	srcH := bounds.Dy()

	var resized image.Image
	if srcW <= maxWidth {
		resized = src
	} else {
		newH := (srcH * maxWidth) / srcW
		dest := image.NewRGBA(image.Rect(0, 0, maxWidth, newH))
		for y := 0; y < newH; y++ {
			for x := 0; x < maxWidth; x++ {
				sx := (x * srcW) / maxWidth
				sy := (y * srcH) / newH
				dest.Set(x, y, src.At(bounds.Min.X+sx, bounds.Min.Y+sy))
			}
		}
		resized = dest
	}

	var buf bytes.Buffer
	switch format {
	case "png":
		if err := png.Encode(&buf, resized); err != nil {
			return nil, "", err
		}
	default:
		format = "jpeg"
		if err := jpeg.Encode(&buf, resized, &jpeg.Options{Quality: 85}); err != nil {
			return nil, "", err
		}
	}
	return buf.Bytes(), format, nil
}

func parseVideoMetadata(videoPath string) (duration int, resolution string, err error) {
	cmd := exec.Command("ffprobe",
		"-v", "error",
		"-show_entries", "format=duration",
		"-show_entries", "stream=width,height",
		"-of", "default=noprint_wrappers=1",
		videoPath,
	)
	out, err := cmd.Output()
	if err != nil {
		return 0, "", err
	}

	var width, height string
	var durationSec float64
	for _, line := range strings.Split(string(out), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.ToLower(strings.TrimSpace(parts[0]))
		val := strings.TrimSpace(parts[1])
		switch key {
		case "width":
			width = val
		case "height":
			height = val
		case "duration":
			if d, err2 := strconv.ParseFloat(val, 64); err2 == nil {
				durationSec = d
			}
		}
	}

	res := ""
	if width != "" && height != "" {
		res = fmt.Sprintf("%sx%s", width, height)
	}
	return int(durationSec), res, nil
}
