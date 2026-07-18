package handlers

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"backend/internal/media/models"
	"backend/internal/media/repository"
	auditService "backend/internal/audit/service"
	"backend/internal/shared/response"

	"github.com/gofiber/fiber/v2"
)

type MediaHandler struct {
	repo      *repository.MediaRepository
	imageChan chan uint
	videoChan chan uint
	uploads   string
	auditSvc  *auditService.AuditService
}

func NewMediaHandler(repo *repository.MediaRepository, imageChan chan uint, videoChan chan uint, uploads string, auditSvc *auditService.AuditService) *MediaHandler {
	return &MediaHandler{
		repo:      repo,
		imageChan: imageChan,
		videoChan: videoChan,
		uploads:   uploads,
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

	if strings.HasPrefix(mimeType, "image/") {
		mediaType = "image"
		sizeLimit = 10 * 1024 * 1024 // 10MB
	} else if mimeType == "video/mp4" || mimeType == "video/webm" {
		mediaType = "video"
		sizeLimit = 500 * 1024 * 1024 // 500MB
	} else {
		// Fallback check based on extension
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext == ".mp4" || ext == ".webm" {
			mediaType = "video"
			if mimeType == "" || mimeType == "application/octet-stream" {
				if ext == ".mp4" {
					mimeType = "video/mp4"
				} else {
					mimeType = "video/webm"
				}
			}
			sizeLimit = 500 * 1024 * 1024
		} else if ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif" || ext == ".webp" {
			mediaType = "image"
			if mimeType == "" || mimeType == "application/octet-stream" {
				if ext == ".png" {
					mimeType = "image/png"
				} else if ext == ".gif" {
					mimeType = "image/gif"
				} else if ext == ".webp" {
					mimeType = "image/webp"
				} else {
					mimeType = "image/jpeg"
				}
			}
			sizeLimit = 10 * 1024 * 1024
		} else {
			return response.Error(c, fiber.StatusBadRequest, "Unsupported file type", fmt.Sprintf("Mime-type %s not supported", mimeType))
		}
	}

	if file.Size > sizeLimit {
		return response.Error(c, fiber.StatusBadRequest, "File size exceeds limit", fmt.Sprintf("Limit is %d bytes, file is %d bytes", sizeLimit, file.Size))
	}

	if err := os.MkdirAll(h.uploads, 0755); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to create uploads directory", err.Error())
	}

	ext := filepath.Ext(file.Filename)
	uniqueName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join(h.uploads, uniqueName)

	if err := c.SaveFile(file, filePath); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to save file", err.Error())
	}

	media := &models.Media{
		FileName:     file.Filename,
		URL:          "/uploads/" + uniqueName,
		ThumbnailURL: "",
		Status:       "processing",
		Type:         mediaType,
		FileSize:     file.Size,
		MimeType:     mimeType,
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	if err := h.repo.Insert(ctx, media); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to insert media to database", err.Error())
	}

	if mediaType == "video" {
		h.videoChan <- media.ID
	} else {
		h.imageChan <- media.ID
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
	if mediaType == "image" || mediaType == "video" {
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

	if mediaType == "image" || mediaType == "video" {
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
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
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
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
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

	// Check if referenced in posts.cover_media_id
	var postCount int64
	if err := h.repo.DB.WithContext(ctx).Table("posts").Where("cover_media_id = ? AND deleted_at IS NULL", id).Count(&postCount).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to check post covers", err.Error())
	}
	if postCount > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Media đang được sử dụng",
		})
	}

	// Check if referenced in post_media.media_id
	var galleryCount int64
	if err := h.repo.DB.WithContext(ctx).Table("post_media").Where("media_id = ?", id).Count(&galleryCount).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to check post gallery", err.Error())
	}
	if galleryCount > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Media đang được sử dụng",
		})
	}

	// Remove files from disk
	fileNameClean := filepath.Base(media.URL)
	filePath := filepath.Join(h.uploads, fileNameClean)
	_ = os.Remove(filePath)

	if media.ThumbnailURL != "" && media.ThumbnailURL != media.URL {
		thumbClean := filepath.Base(media.ThumbnailURL)
		thumbPath := filepath.Join(h.uploads, thumbClean)
		_ = os.Remove(thumbPath)
	}

	// Soft delete DB record
	if err := h.repo.Delete(ctx, uint(id)); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to delete media", err.Error())
	}

	if userID, ok := c.Locals("user_id").(uint); ok {
		val := uint(id)
		h.auditSvc.Log(&userID, "delete_media", "media", &val, nil, c.IP())
	}

	return response.Success(c, fiber.StatusOK, nil, "Media deleted successfully")
}
