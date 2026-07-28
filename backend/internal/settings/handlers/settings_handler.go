package handlers

import (
	"context"

	"backend/internal/settings/models"
	"backend/internal/settings/repository"
	"backend/internal/shared/response"
	storagePkg "backend/pkg/storage"

	"github.com/gofiber/fiber/v2"
)

type SettingsHandler struct {
	repo       *repository.SettingsRepository
	dynStorage *storagePkg.DynamicStorage
}

func NewSettingsHandler(repo *repository.SettingsRepository, dynStorage *storagePkg.DynamicStorage) *SettingsHandler {
	return &SettingsHandler{
		repo:       repo,
		dynStorage: dynStorage,
	}
}

// Các key an toàn được phép hiển thị cho Client Public (không chứa thông tin nhạy cảm)
var publicSettingsWhitelist = map[string]bool{
	"site_name":             true,
	"site_description":      true,
	"logo_url":              true,
	"comments_enabled":      true,
	"comments_auto_approve": true,
	"footer_copyright":      true,
	"footer_facebook_url":   true,
	"footer_github_url":     true,
	"footer_linkedin_url":   true,
	"footer_twitter_url":    true,
	"theme_primary_color":   true,
	"theme_button_bg":       true,
	"theme_text_color":      true,
	"hero_kicker":           true,
	"hero_title_line1":      true,
	"hero_title_line2":      true,
	"hero_subtitle":         true,
	"slider_images":         true,
}

// GetPublicSettings handles GET /api/public/settings
func (h *SettingsHandler) GetPublicSettings(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	settings, err := h.repo.FindAll(ctx)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve public settings", err.Error())
	}

	settingsMap := make(map[string]string)
	for _, setting := range settings {
		if publicSettingsWhitelist[setting.Key] {
			settingsMap[setting.Key] = setting.Value
		}
	}

	return response.Success(c, fiber.StatusOK, settingsMap, "Public settings retrieved successfully")
}

// GetSettings handles GET /api/settings (ADMIN ONLY - PROTECTED)
func (h *SettingsHandler) GetSettings(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	settings, err := h.repo.FindAll(ctx)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve settings", err.Error())
	}

	settingsMap := make(map[string]string)
	for _, setting := range settings {
		val := setting.Value
		// Chỉ che duy nhất mật khẩu/secret key khi hiển thị trên giao diện admin form
		if setting.Key == "s3_secret_key" && val != "" {
			val = "********"
		}
		settingsMap[setting.Key] = val
	}

	return response.Success(c, fiber.StatusOK, settingsMap, "Settings retrieved successfully")
}


// UpdateSettings handles PUT /api/settings
func (h *SettingsHandler) UpdateSettings(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	var req map[string]string
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	for k, v := range req {
		// Bỏ qua không lưu nếu client gửi s3_secret_key dạng ẩn "********" (tức là không đổi)
		if k == "s3_secret_key" && v == "********" {
			continue
		}

		setting, err := h.repo.FindByKey(ctx, k)
		if err != nil {
			// Not found, let's insert it
			newSetting := &models.Setting{
				Key:   k,
				Value: v,
			}
			if err := h.repo.Insert(ctx, newSetting); err != nil {
				return response.Error(c, fiber.StatusInternalServerError, "Failed to save setting: "+k, err.Error())
			}
		} else {
			// Found, update the value
			setting.Value = v
			if err := h.repo.Update(ctx, setting); err != nil {
				return response.Error(c, fiber.StatusInternalServerError, "Failed to update setting: "+k, err.Error())
			}
		}
	}

	// Reload dynamic storage settings in memory
	if h.dynStorage != nil {
		h.dynStorage.Reload(ctx)
	}

	// Fetch all settings and return them as updated map (lọc lại sau khi update)
	settings, err := h.repo.FindAll(ctx)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve settings after update", err.Error())
	}

	settingsMap := make(map[string]string)
	for _, s := range settings {
		val := s.Value
		if s.Key == "s3_secret_key" && val != "" {
			val = "********"
		}
		settingsMap[s.Key] = val
	}

	return response.Success(c, fiber.StatusOK, settingsMap, "Settings updated successfully")
}
