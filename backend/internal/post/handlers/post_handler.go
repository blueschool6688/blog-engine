package handlers

import (
	"context"
	"fmt"
	"strconv"

	"backend/internal/post/commands"
	"backend/internal/post/queries"
	auditService "backend/internal/audit/service"
	"backend/internal/shared/response"
	"backend/internal/shared/validator"

	"github.com/gofiber/fiber/v2"
)

type PostHandler struct {
	commandService *commands.CommandService
	queryService   *queries.QueryService
	auditSvc       *auditService.AuditService
}

func NewPostHandler(cmd *commands.CommandService, qry *queries.QueryService, auditSvc *auditService.AuditService) *PostHandler {
	return &PostHandler{
		commandService: cmd,
		queryService:   qry,
		auditSvc:       auditSvc,
	}
}

func (h *PostHandler) Create(c *fiber.Ctx) error {
	var cmd commands.CreatePostCommand
	if err := c.BodyParser(&cmd); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if err := validator.Validate(&cmd); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Validation failed", err)
	}


	// Attach the authenticated user as the author.
	if userID, ok := c.Locals("user_id").(uint); ok {
		cmd.AuthorID = &userID
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	post, err := h.commandService.CreatePost(ctx, cmd)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to create post", err.Error())
	}

	if userID, ok := c.Locals("user_id").(uint); ok {
		h.auditSvc.Log(&userID, "create_post", "post", &post.ID, cmd, c.IP())
	}

	return response.Success(c, fiber.StatusCreated, post, "Post created successfully")
}

func (h *PostHandler) Update(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", err.Error())
	}

	var cmd commands.UpdatePostCommand
	if err := c.BodyParser(&cmd); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if err := validator.Validate(&cmd); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Validation failed", err)
	}


	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	post, err := h.commandService.UpdatePost(ctx, uint(id), cmd)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to update post", err.Error())
	}

	if userID, ok := c.Locals("user_id").(uint); ok {
		h.auditSvc.Log(&userID, "update_post", "post", &post.ID, cmd, c.IP())
	}

	return response.Success(c, fiber.StatusOK, post, "Post updated successfully")
}

func (h *PostHandler) Delete(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	force := c.Query("force") == "true"

	if err := h.commandService.DeletePost(ctx, uint(id), force); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to delete post", err.Error())
	}

	if userID, ok := c.Locals("user_id").(uint); ok {
		val := uint(id)
		h.auditSvc.Log(&userID, "delete_post", "post", &val, nil, c.IP())
	}

	return response.Success(c, fiber.StatusOK, nil, "Post deleted successfully")
}

func (h *PostHandler) Restore(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	if err := h.commandService.RestorePost(ctx, uint(id)); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to restore post", err.Error())
	}

	if userID, ok := c.Locals("user_id").(uint); ok {
		val := uint(id)
		h.auditSvc.Log(&userID, "restore_post", "post", &val, nil, c.IP())
	}

	return response.Success(c, fiber.StatusOK, nil, "Post restored successfully")
}

func (h *PostHandler) Bulk(c *fiber.Ctx) error {
	var cmd commands.BulkPostCommand
	if err := c.BodyParser(&cmd); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if err := validator.Validate(&cmd); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Validation failed", err)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	count, err := h.commandService.BulkPost(ctx, cmd)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Bulk action failed", err.Error())
	}

	if userID, ok := c.Locals("user_id").(uint); ok {
		h.auditSvc.Log(&userID, "bulk_post", "post", nil, cmd, c.IP())
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{"affected": count}, fmt.Sprintf("Bulk %s completed", cmd.Action))
}


func (h *PostHandler) List(c *fiber.Ctx) error {
	offsetStr := c.Query("offset", "0")
	limitStr := c.Query("limit", "10")
	status := c.Query("status", "")
	search := c.Query("search", "")
	categoryIDStr := c.Query("category_id", "0")
	tagIDStr := c.Query("tag_id", "0")
	isFeaturedStr := c.Query("is_featured", "false")

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	categoryID, _ := strconv.ParseUint(categoryIDStr, 10, 32)
	tagID, _ := strconv.ParseUint(tagIDStr, 10, 32)
	isFeatured, _ := strconv.ParseBool(isFeaturedStr)
	withDeleted := c.Query("with_deleted") == "true"

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	res, err := h.queryService.ListPosts(ctx, offset, limit, status, search, uint(categoryID), uint(tagID), isFeatured, withDeleted)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to list posts", err.Error())
	}

	return response.Success(c, fiber.StatusOK, res, "Posts retrieved successfully")
}

func (h *PostHandler) Detail(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	post, err := h.queryService.GetPostByID(ctx, uint(id))
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "Post not found", err.Error())
	}

	return response.Success(c, fiber.StatusOK, post, "Post retrieved successfully")
}

func (h *PostHandler) AttachMedia(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", err.Error())
	}

	type AttachReq struct {
		MediaID uint   `json:"media_id"`
		Caption string `json:"caption"`
		AltText string `json:"alt_text"`
	}

	var req AttachReq
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if req.MediaID == 0 {
		return response.Error(c, fiber.StatusBadRequest, "media_id is required", "")
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	postMedia, err := h.commandService.AttachMedia(ctx, uint(id), req.MediaID, req.Caption, req.AltText)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to attach media to gallery", err.Error())
	}

	return response.Success(c, fiber.StatusCreated, postMedia, "Media attached to gallery successfully")
}

func (h *PostHandler) DetachMedia(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", err.Error())
	}

	mediaIdStr := c.Params("mediaId")
	mediaID, err := strconv.ParseUint(mediaIdStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid media ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	err = h.commandService.DetachMedia(ctx, uint(id), uint(mediaID))
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to detach media from gallery", err.Error())
	}

	return response.Success(c, fiber.StatusOK, nil, "Media detached from gallery successfully")
}

func (h *PostHandler) ReorderGallery(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", err.Error())
	}

	var req []commands.ReorderItem
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	err = h.commandService.ReorderGallery(ctx, uint(id), req)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to reorder gallery", err.Error())
	}

	return response.Success(c, fiber.StatusOK, nil, "Gallery reordered successfully")
}

func (h *PostHandler) GetGallery(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid post ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	gallery, err := h.queryService.GetGallery(ctx, uint(id))
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to fetch gallery list", err.Error())
	}

	return response.Success(c, fiber.StatusOK, gallery, "Gallery list retrieved successfully")
}
