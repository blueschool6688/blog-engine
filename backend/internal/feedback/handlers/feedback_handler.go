package handlers

import (
	"context"
	"strconv"

	"backend/internal/feedback/models"
	"backend/internal/feedback/repository"
	auditService "backend/internal/audit/service"
	"backend/internal/shared/response"
	"backend/internal/shared/validator"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type createFeedbackRequest struct {
	Name    string `json:"name" validate:"required,min=2,max=100"`
	Email   string `json:"email" validate:"required,email"`
	Subject string `json:"subject" validate:"max=200"`
	Content string `json:"content" validate:"required,min=10,max=2000"`
	Rating  int    `json:"rating" validate:"required,min=1,max=5"`
}

type updateStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=pending reviewed archived"`
}

type FeedbackHandler struct {
	repo     *repository.FeedbackRepository
	auditSvc *auditService.AuditService
}

func NewFeedbackHandler(repo *repository.FeedbackRepository, auditSvc *auditService.AuditService) *FeedbackHandler {
	return &FeedbackHandler{repo: repo, auditSvc: auditSvc}
}

// Create handles POST /api/public/feedbacks
func (h *FeedbackHandler) Create(c *fiber.Ctx) error {
	var req createFeedbackRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if err := validator.Validate(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Validation failed", err)
	}

	feedback := &models.Feedback{
		Name:    req.Name,
		Email:   req.Email,
		Subject: req.Subject,
		Content: req.Content,
		Rating:  req.Rating,
		Status:  "pending",
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	if err := h.repo.Insert(ctx, feedback); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to submit feedback", err.Error())
	}

	h.auditSvc.Log(nil, "submit_feedback", "feedback", &feedback.ID, req, c.IP())

	return response.Success(c, fiber.StatusCreated, feedback, "Feedback submitted successfully")
}

// List handles GET /api/feedbacks (Admin only)
func (h *FeedbackHandler) List(c *fiber.Ctx) error {
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil || offset < 0 {
		offset = 0
	}
	limit, err := strconv.Atoi(c.Query("limit", "20"))
	if err != nil || limit <= 0 {
		limit = 20
	}
	status := c.Query("status", "")

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	tx := h.repo.DB.WithContext(ctx).Model(&models.Feedback{})
	if status != "" {
		tx = tx.Where("status = ?", status)
	}

	var total int64
	if err := tx.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to count feedbacks", err.Error())
	}

	var feedbacks []models.Feedback
	if err := tx.Order("id DESC").Offset(offset).Limit(limit).Find(&feedbacks).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve feedbacks", err.Error())
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"items": feedbacks,
		"total": total,
	}, "Feedbacks retrieved successfully")
}

// UpdateStatus handles PUT /api/feedbacks/:id/status (Admin only)
func (h *FeedbackHandler) UpdateStatus(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid feedback ID", err.Error())
	}

	var req updateStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if err := validator.Validate(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Validation failed", err)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	feedback, err := h.repo.FindByID(ctx, uint(id))
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "Feedback not found", err.Error())
	}

	feedback.Status = req.Status
	if err := h.repo.Update(ctx, feedback); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to update feedback status", err.Error())
	}

	return response.Success(c, fiber.StatusOK, feedback, "Feedback status updated successfully")
}

// Delete handles DELETE /api/feedbacks/:id (Admin only)
func (h *FeedbackHandler) Delete(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid feedback ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	if err := h.repo.Delete(ctx, uint(id)); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to delete feedback", err.Error())
	}

	return response.Success(c, fiber.StatusOK, nil, "Feedback deleted successfully")
}
