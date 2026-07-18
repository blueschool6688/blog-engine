package handlers

import (
	"context"
	"strconv"

	"backend/internal/audit/service"
	"backend/internal/shared/response"

	"github.com/gofiber/fiber/v2"
)

type AuditHandler struct {
	auditSvc *service.AuditService
}

func NewAuditHandler(auditSvc *service.AuditService) *AuditHandler {
	return &AuditHandler{auditSvc: auditSvc}
}

// List handles GET /api/audit-logs
func (h *AuditHandler) List(c *fiber.Ctx) error {
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil || offset < 0 {
		offset = 0
	}
	limit, err := strconv.Atoi(c.Query("limit", "20"))
	if err != nil || limit <= 0 {
		limit = 20
	}
	entityType := c.Query("entity_type", "")

	var userIDPtr *uint
	if uidStr := c.Query("user_id", ""); uidStr != "" {
		uid, err := strconv.ParseUint(uidStr, 10, 32)
		if err == nil {
			val := uint(uid)
			userIDPtr = &val
		}
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	logs, total, err := h.auditSvc.GetLogs(ctx, offset, limit, userIDPtr, entityType)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to list audit logs", err.Error())
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"items": logs,
		"total": total,
	}, "Audit logs retrieved successfully")
}
