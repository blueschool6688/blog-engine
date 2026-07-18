package handlers

import (
	"context"

	"backend/internal/settings/models"
	"backend/internal/settings/repository"
	"backend/internal/shared/response"

	"github.com/gofiber/fiber/v2"
)

type SettingsHandler struct {
	repo *repository.SettingsRepository
}

func NewSettingsHandler(repo *repository.SettingsRepository) *SettingsHandler {
	return &SettingsHandler{
		repo: repo,
	}
}

// GetSettings handles GET /api/settings
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
		settingsMap[setting.Key] = setting.Value
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

	// Fetch all settings and return them as updated map
	settings, err := h.repo.FindAll(ctx)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve settings after update", err.Error())
	}

	settingsMap := make(map[string]string)
	for _, s := range settings {
		settingsMap[s.Key] = s.Value
	}

	return response.Success(c, fiber.StatusOK, settingsMap, "Settings updated successfully")
}
