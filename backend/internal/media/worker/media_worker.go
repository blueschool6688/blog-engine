package worker

import (
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
)

type MediaWorker struct {
	repo       *repository.MediaRepository
	logger     *logger.Logger
	imageQueue chan uint
	videoQueue chan uint
	uploads    string
}

func NewMediaWorker(repo *repository.MediaRepository, logger *logger.Logger, imageQueue chan uint, videoQueue chan uint, uploads string) *MediaWorker {
	return &MediaWorker{
		repo:       repo,
		logger:     logger,
		imageQueue: imageQueue,
		videoQueue: videoQueue,
		uploads:    uploads,
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
				w.processImage(id)
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
				w.processVideo(id)
			}
		}
	}()
}

func (w *MediaWorker) processImage(id uint) {
	time.Sleep(3 * time.Second)

	ctx := context.Background()
	media, err := w.repo.FindByID(ctx, id)
	if err != nil {
		w.logger.Error("Failed to find media ID %d: %v", id, err)
		return
	}

	fileNameClean := filepath.Base(media.URL)
	filePath := filepath.Join(w.uploads, fileNameClean)

	ext := filepath.Ext(fileNameClean)
	thumbName := strings.TrimSuffix(fileNameClean, ext) + "_thumb" + ext
	thumbPath := filepath.Join(w.uploads, thumbName)

	w.logger.Info("Resizing file: %s -> %s", filePath, thumbPath)

	err = createThumbnail(filePath, thumbPath, 300)
	if err != nil {
		w.logger.Error("Failed to create thumbnail for media ID %d: %v. Fallback to original URL.", id, err)
		media.ThumbnailURL = media.URL
		media.Status = "completed"
	} else {
		media.ThumbnailURL = "/uploads/" + thumbName
		media.Status = "completed"
	}

	err = w.repo.Update(ctx, media)
	if err != nil {
		w.logger.Error("Failed to update media status for ID %d: %v", id, err)
	} else {
		w.logger.Info("Successfully processed media ID: %d", id)
	}
}

func (w *MediaWorker) processVideo(id uint) {
	time.Sleep(3 * time.Second)

	ctx := context.Background()
	media, err := w.repo.FindByID(ctx, id)
	if err != nil {
		w.logger.Error("Failed to find media ID %d: %v", id, err)
		return
	}

	fileNameClean := filepath.Base(media.URL)
	filePath := filepath.Join(w.uploads, fileNameClean)

	ext := filepath.Ext(fileNameClean)
	thumbName := strings.TrimSuffix(fileNameClean, ext) + "_thumb.jpg"
	thumbPath := filepath.Join(w.uploads, thumbName)

	w.logger.Info("Extracting poster from video: %s -> %s", filePath, thumbPath)

	// Execute FFmpeg to extract poster frame
	cmd := exec.Command("ffmpeg", "-y", "-ss", "00:00:01", "-i", filePath, "-frames:v", "1", "-q:v", "2", thumbPath)
	if err := cmd.Run(); err != nil {
		w.logger.Error("Failed to run ffmpeg for media ID %d: %v. Fallback to default/empty thumbnail.", id, err)
		media.ThumbnailURL = ""
		media.Status = "failed"
	} else {
		media.ThumbnailURL = "/uploads/" + thumbName
		media.Status = "completed"
	}

	// Read duration and resolution
	duration, resolution, err := parseVideoMetadata(filePath)
	if err != nil {
		w.logger.Error("Failed to parse video metadata for media ID %d: %v. Using defaults.", id, err)
		duration = 0
		resolution = "1920x1080"
	}
	media.Duration = duration
	media.Resolution = resolution

	if err := w.repo.Update(ctx, media); err != nil {
		w.logger.Error("Failed to update media status for video ID %d: %v", id, err)
	} else {
		w.logger.Info("Successfully processed video ID: %d", id)
	}
}

func parseVideoMetadata(videoPath string) (int, string, error) {
	cmd := exec.Command("ffprobe", "-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=width,height", "-of", "default=noprint_wrappers=1", videoPath)
	out, err := cmd.Output()
	if err != nil {
		return 0, "", err
	}
	lines := strings.Split(string(out), "\n")
	var width, height string
	var durationSec float64
	for _, line := range lines {
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
			if d, err := strconv.ParseFloat(val, 64); err == nil {
				durationSec = d
			}
		}
	}
	resolution := ""
	if width != "" && height != "" {
		resolution = fmt.Sprintf("%sx%s", width, height)
	}
	return int(durationSec), resolution, nil
}

func createThumbnail(srcPath, destPath string, width int) error {
	file, err := os.Open(srcPath)
	if err != nil {
		return fmt.Errorf("open file: %w", err)
	}
	defer file.Close()

	src, format, err := image.Decode(file)
	if err != nil {
		return fmt.Errorf("decode image: %w", err)
	}

	bounds := src.Bounds()
	srcWidth := bounds.Dx()
	srcHeight := bounds.Dy()

	if srcWidth <= width {
		return copyFile(srcPath, destPath)
	}

	height := (srcHeight * width) / srcWidth

	dest := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			srcX := (x * srcWidth) / width
			srcY := (y * srcHeight) / height
			dest.Set(x, y, src.At(bounds.Min.X+srcX, bounds.Min.Y+srcY))
		}
	}

	out, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("create thumb file: %w", err)
	}
	defer out.Close()

	if format == "png" {
		return png.Encode(out, dest)
	}
	return jpeg.Encode(out, dest, &jpeg.Options{Quality: 85})
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}
