package handlers

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"path/filepath"
	"strconv"
	"strings"

	"backend/internal/media/models"
	"backend/internal/media/repository"
	auditService "backend/internal/audit/service"
	"backend/internal/shared/response"
	"backend/pkg/storage"

	"github.com/gofiber/fiber/v2"
)

type MediaHandler struct {
	repo      *repository.MediaRepository
	imageChan chan uint
	videoChan chan uint
	storage   storage.Storage
	auditSvc  *auditService.AuditService
}

func NewMediaHandler(
	repo *repository.MediaRepository,
	imageChan chan uint,
	videoChan chan uint,
	store storage.Storage,
	auditSvc *auditService.AuditService,
) *MediaHandler {
	return &MediaHandler{
		repo:      repo,
		imageChan: imageChan,
		videoChan: videoChan,
		storage:   store,
		auditSvc:  auditSvc,
	}
}

func (h *MediaHandler) Upload(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "No file uploaded", err.Error())
	}

	mimeType := file.Header.Get("Content-Type")
	var mediaType string
	var sizeLimit int64
	var folder string // thư mục phân loại: images, videos, documents

	if strings.HasPrefix(mimeType, "image/") {
		mediaType = "image"
		folder = "images"
		sizeLimit = 10 * 1024 * 1024 // 10MB
	} else if mimeType == "video/mp4" || mimeType == "video/webm" {
		mediaType = "video"
		folder = "videos"
		sizeLimit = 500 * 1024 * 1024 // 500MB
	} else if isDocumentMime(mimeType) {
		mediaType = "document"
		folder = "documents"
		sizeLimit = 50 * 1024 * 1024 // 50MB
	} else {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		mediaType, mimeType, folder, sizeLimit = detectByExt(ext, mimeType)
		if mediaType == "" {
			return response.Error(c, fiber.StatusBadRequest, "Unsupported file type",
				fmt.Sprintf("Mime-type %s not supported", mimeType))
		}
	}

	if file.Size > sizeLimit {
		return response.Error(c, fiber.StatusBadRequest, "File size exceeds limit",
			fmt.Sprintf("Limit is %d bytes, file is %d bytes", sizeLimit, file.Size))
	}

	src, err := file.Open()
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to open uploaded file", err.Error())
	}
	defer src.Close()

	storageKey := storage.BuildKey(folder, file.Filename)

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	if err := h.storage.UploadFile(ctx, storageKey, src, mimeType); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to upload file to storage", err.Error())
	}

	publicURL := h.storage.GetPublicURL(storageKey)

	media := &models.Media{
		FileName:        file.Filename,
		URL:             publicURL,
		StorageProvider: h.storage.DriverName(),
		StorageKey:      storageKey,
		Status:          "processing",
		Type:            mediaType,
		FileSize:        file.Size,
		MimeType:        mimeType,
	}

	// Generate and upload thumbnail synchronously if it's an image
	if mediaType == "image" {
		if src, err := file.Open(); err == nil {
			if thumbBuf, format, err := createThumbnailInMemory(src, 300); err == nil {
				thumbContentType := "image/jpeg"
				if format == "png" {
					thumbContentType = "image/png"
				}
				thumbKey := storage.BuildThumbnailKey(storageKey)
				if err := h.storage.UploadFile(ctx, thumbKey, bytes.NewReader(thumbBuf), thumbContentType); err == nil {
					media.ThumbnailURL = h.storage.GetPublicURL(thumbKey)
					media.ThumbnailStorageKey = thumbKey
				}
			}
			src.Close()
		}
		// If thumbnail fails or succeeds, we mark image processing as completed synchronously
		media.Status = "completed"
	}

	if err := h.repo.Insert(ctx, media); err != nil {
		// Dọn dẹp storage nếu DB insert fail
		_ = h.storage.DeleteObject(ctx, storageKey)
		if media.ThumbnailStorageKey != "" {
			_ = h.storage.DeleteObject(ctx, media.ThumbnailStorageKey)
		}
		return response.Error(c, fiber.StatusInternalServerError, "Failed to save media record", err.Error())
	}

	// Đẩy vào queue xử lý background (chỉ xử lý video)
	switch mediaType {
	case "video":
		h.videoChan <- media.ID
	case "image":
		// Already handled synchronously
	default:
		media.Status = "completed"
		h.repo.Update(ctx, media)
	}

	if userID, ok := c.Locals("user_id").(uint); ok {
		h.auditSvc.Log(&userID, "upload_media", "media", &media.ID, media, c.IP())
	}

	return response.Success(c, fiber.StatusCreated, media, "Media uploaded and is being processed")
}

func (h *MediaHandler) List(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	mediaType := c.Query("type")
	limitStr := c.Query("limit")
	pageStr := c.Query("page")

	query := make(map[string]interface{})
	if mediaType == "image" || mediaType == "video" || mediaType == "document" {
		query["type"] = mediaType
	}

	if limitStr != "" || pageStr != "" {
		limit := 10
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
		page := 1
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
		offset := (page - 1) * limit

		total, err := h.repo.Count(ctx, query)
		if err != nil {
			return response.Error(c, fiber.StatusInternalServerError, "Failed to count media", err.Error())
		}
		list, err := h.repo.FindWithPagination(ctx, offset, limit, query)
		if err != nil {
			return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve media list", err.Error())
		}
		return response.Success(c, fiber.StatusOK, fiber.Map{
			"items": list,
			"total": total,
			"page":  page,
			"limit": limit,
		}, "Media list retrieved successfully")
	}

	list, err := h.repo.FindAll(ctx)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve media list", err.Error())
	}

	if mediaType != "" {
		var filtered []*models.Media
		for _, m := range list {
			if m.Type == mediaType {
				filtered = append(filtered, m)
			}
		}
		return response.Success(c, fiber.StatusOK, filtered, "Media list retrieved successfully")
	}

	return response.Success(c, fiber.StatusOK, list, "Media list retrieved successfully")
}

func (h *MediaHandler) Detail(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid media ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	media, err := h.repo.FindByID(ctx, uint(id))
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "Media not found", err.Error())
	}
	return response.Success(c, fiber.StatusOK, media, "Media detail retrieved successfully")
}

func (h *MediaHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid media ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	media, err := h.repo.FindByID(ctx, uint(id))
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "Media not found", err.Error())
	}

	// Kiểm tra media có đang được sử dụng làm cover hoặc trong post gallery không
	var postCount, galleryCount int64
	h.repo.DB.WithContext(ctx).Table("posts").Where("cover_media_id = ? AND deleted_at IS NULL", id).Count(&postCount)
	h.repo.DB.WithContext(ctx).Table("post_media").Where("media_id = ?", id).Count(&galleryCount)

	if postCount > 0 || galleryCount > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Media đang được sử dụng",
		})
	}

	// Xóa files khỏi storage (Chỉ xóa nếu storage_provider của record trùng với driver đang chạy, hoặc xóa trực tiếp từ driver nếu cần)
	// Để đơn giản và an toàn, ta luôn gửi yêu cầu xóa đến driver đang chạy:
	if media.StorageKey != "" {
		_ = h.storage.DeleteObject(ctx, media.StorageKey)
	}

	if media.ThumbnailStorageKey != "" && media.ThumbnailStorageKey != media.StorageKey {
		_ = h.storage.DeleteObject(ctx, media.ThumbnailStorageKey)
	}

	// Xóa record trong DB
	if err := h.repo.Delete(ctx, uint(id)); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to delete media", err.Error())
	}

	if userID, ok := c.Locals("user_id").(uint); ok {
		val := uint(id)
		h.auditSvc.Log(&userID, "delete_media", "media", &val, nil, c.IP())
	}
	return response.Success(c, fiber.StatusOK, nil, "Media deleted successfully")
}

// ── helpers ──────────────────────────────────────────────────────────────────

func isDocumentMime(mimeType string) bool {
	docs := []string{
		"application/pdf",
		"text/plain",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	}
	for _, d := range docs {
		if mimeType == d {
			return true
		}
	}
	return false
}

func detectByExt(ext, originalMime string) (mediaType, mimeType, folder string, sizeLimit int64) {
	switch ext {
	case ".mp4", ".webm":
		mediaType = "video"
		folder = "videos"
		sizeLimit = 500 * 1024 * 1024
		if originalMime == "" || originalMime == "application/octet-stream" {
			if ext == ".mp4" {
				mimeType = "video/mp4"
			} else {
				mimeType = "video/webm"
			}
		} else {
			mimeType = originalMime
		}
	case ".pdf", ".txt", ".doc", ".docx", ".xls", ".xlsx":
		mediaType = "document"
		folder = "documents"
		sizeLimit = 50 * 1024 * 1024
		extMimeMap := map[string]string{
			".pdf":  "application/pdf",
			".txt":  "text/plain",
			".doc":  "application/msword",
			".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			".xls":  "application/vnd.ms-excel",
			".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		}
		if originalMime == "" || originalMime == "application/octet-stream" {
			mimeType = extMimeMap[ext]
		} else {
			mimeType = originalMime
		}
	case ".jpg", ".jpeg", ".png", ".gif", ".webp":
		mediaType = "image"
		folder = "images"
		sizeLimit = 10 * 1024 * 1024
		extMimeMap := map[string]string{
			".png":  "image/png",
			".gif":  "image/gif",
			".webp": "image/webp",
		}
		if originalMime == "" || originalMime == "application/octet-stream" {
			if m, ok := extMimeMap[ext]; ok {
				mimeType = m
			} else {
				mimeType = "image/jpeg"
			}
		} else {
			mimeType = originalMime
		}
	}
	return
}

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
