package handlers

import (
	"context"
	"strconv"

	"backend/internal/comment/service"
	auditService "backend/internal/audit/service"
	"backend/internal/shared/response"

	"github.com/gofiber/fiber/v2"
)

type CommentHandler struct {
	svc      *service.CommentService
	auditSvc *auditService.AuditService
}

func NewCommentHandler(svc *service.CommentService, auditSvc *auditService.AuditService) *CommentHandler {
	return &CommentHandler{svc: svc, auditSvc: auditSvc}
}

// ListComments handles GET /api/public/posts/:id/comments
func (h *CommentHandler) ListComments(c *fiber.Ctx) error {
	postID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	comments, err := h.svc.GetApprovedComments(ctx, uint(postID))
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to fetch comments", err.Error())
	}

	return response.Success(c, fiber.StatusOK, comments, "Comments retrieved successfully")
}

type createCommentRequest struct {
	AuthorName  string `json:"author_name"`
	AuthorEmail string `json:"author_email"`
	Content     string `json:"content"`
	ParentID    *uint  `json:"parent_id"`
}

// CreateComment handles POST /api/public/posts/:id/comments
func (h *CommentHandler) CreateComment(c *fiber.Ctx) error {
	postID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", nil)
	}

	var req createCommentRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	comment, err := h.svc.CreateComment(ctx, uint(postID), req.AuthorName, req.AuthorEmail, req.Content, c.IP(), req.ParentID)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	h.auditSvc.Log(nil, "submit_comment", "comment", &comment.ID, req, c.IP())

	statusCode := fiber.StatusCreated
	msg := "Comment submitted and awaiting approval"
	if comment.Status == "approved" {
		msg = "Comment posted successfully"
	}

	return response.Success(c, statusCode, comment, msg)
}

type reactRequest struct {
	Emoji string `json:"emoji"`
}

// GetReactions handles GET /api/public/posts/:id/reactions
func (h *CommentHandler) GetReactions(c *fiber.Ctx) error {
	postID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", nil)
	}

	fingerprint := service.BuildFingerprint(c.IP(), c.Get("User-Agent"))
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	counts, err := h.svc.GetReactions(ctx, uint(postID), fingerprint)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to fetch reactions", err.Error())
	}

	return response.Success(c, fiber.StatusOK, counts, "Reactions retrieved successfully")
}

// React handles POST /api/public/posts/:id/react
func (h *CommentHandler) React(c *fiber.Ctx) error {
	postID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", nil)
	}

	var req reactRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	fingerprint := service.BuildFingerprint(c.IP(), c.Get("User-Agent"))
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	counts, err := h.svc.React(ctx, uint(postID), req.Emoji, fingerprint)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	postIDVal := uint(postID)
	h.auditSvc.Log(nil, "submit_reaction", "reaction", &postIDVal, req, c.IP())

	return response.Success(c, fiber.StatusOK, counts, "Reaction toggled successfully")
}

// ListPendingComments handles GET /api/posts/comments (admin moderation)
func (h *CommentHandler) ListPendingComments(c *fiber.Ctx) error {
	offset, _ := strconv.Atoi(c.Query("offset", "0"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	status := c.Query("status", "pending")

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	comments, total, err := h.svc.ListAll(ctx, offset, limit, status)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to fetch comments", err.Error())
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"items": comments,
		"total": total,
	}, "Comments retrieved successfully")
}

// Approve handles PUT /api/posts/comments/:id/approve
func (h *CommentHandler) Approve(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid comment ID", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	if err := h.svc.ApproveComment(ctx, uint(id)); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to approve comment", err.Error())
	}

	return response.Success(c, fiber.StatusOK, nil, "Comment approved successfully")
}

// Reject handles PUT /api/posts/comments/:id/reject
func (h *CommentHandler) Reject(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid comment ID", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	if err := h.svc.RejectComment(ctx, uint(id)); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to reject comment", err.Error())
	}

	return response.Success(c, fiber.StatusOK, nil, "Comment rejected successfully")
}

// Delete handles DELETE /api/posts/comments/:id
func (h *CommentHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid comment ID", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	if err := h.svc.DeleteComment(ctx, uint(id)); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to delete comment", err.Error())
	}

	return response.Success(c, fiber.StatusOK, nil, "Comment deleted successfully")
}

// PendingCount handles GET /api/posts/comments/pending-count
func (h *CommentHandler) PendingCount(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	count, err := h.svc.CountPending(ctx)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to count pending comments", err.Error())
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{"count": count}, "Pending comment count retrieved")
}
