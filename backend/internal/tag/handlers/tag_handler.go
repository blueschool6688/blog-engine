package handlers

import (
	"context"
	"regexp"
	"strconv"
	"strings"

	"backend/internal/shared/response"
	"backend/internal/tag/models"
	"backend/internal/tag/repository"

	"github.com/gofiber/fiber/v2"
)

type TagHandler struct {
	repo *repository.TagRepository
}

func NewTagHandler(repo *repository.TagRepository) *TagHandler {
	return &TagHandler{
		repo: repo,
	}
}

type CreateTagRequest struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

func (h *TagHandler) List(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	withDeleted := c.Query("with_deleted") == "true"
	tags, err := h.repo.FindAll(ctx, withDeleted)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve tags", err.Error())
	}
	return response.Success(c, fiber.StatusOK, tags, "Tags retrieved successfully")
}

func (h *TagHandler) Create(c *fiber.Ctx) error {
	var req CreateTagRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if req.Name == "" {
		return response.Error(c, fiber.StatusBadRequest, "Tag name is required", nil)
	}

	slug := req.Slug
	if slug == "" {
		slug = generateSlug(req.Name)
	} else {
		slug = generateSlug(slug)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	existing, err := h.repo.FindBySlug(ctx, slug)
	if err == nil && existing != nil {
		return response.Error(c, fiber.StatusBadRequest, "Tag with this slug already exists", nil)
	}

	tag := &models.Tag{
		Name: req.Name,
		Slug: slug,
	}

	if err := h.repo.Insert(ctx, tag); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to create tag", err.Error())
	}

	return response.Success(c, fiber.StatusCreated, tag, "Tag created successfully")
}

func (h *TagHandler) Delete(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid tag ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	force := c.Query("force") == "true"

	if force {
		err = h.repo.PermanentDelete(ctx, uint(id))
	} else {
		err = h.repo.Delete(ctx, uint(id))
	}

	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to delete tag", err.Error())
	}

	return response.Success(c, fiber.StatusOK, nil, "Tag deleted successfully")
}

func (h *TagHandler) Restore(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid tag ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	if err := h.repo.Restore(ctx, uint(id)); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to restore tag", err.Error())
	}

	return response.Success(c, fiber.StatusOK, nil, "Tag restored successfully")
}

func generateSlug(title string) string {
	slug := strings.ToLower(title)
	
	// Convert Vietnamese accented characters to ASCII equivalents
	vietnameseMap := map[string]string{
		"à": "a", "á": "a", "ạ": "a", "ả": "a", "ã": "a", "â": "a", "ầ": "a", "ấ": "a", "ậ": "a", "ẩ": "a", "ẫ": "a", "ă": "a", "ằ": "a", "ắ": "a", "ặ": "a", "ẳ": "a", "ẵ": "a",
		"è": "e", "é": "e", "ẹ": "e", "ẻ": "e", "ẽ": "e", "ê": "e", "ề": "e", "ế": "e", "ệ": "e", "ể": "e", "ễ": "e",
		"ì": "i", "í": "i", "ị": "i", "ỉ": "i", "ĩ": "i",
		"ò": "o", "ó": "o", "ọ": "o", "ỏ": "o", "õ": "o", "ô": "o", "ồ": "o", "ố": "o", "ộ": "o", "ổ": "o", "ỗ": "o", "ơ": "o", "ờ": "o", "ớ": "o", "ợ": "o", "ở": "o", "ỡ": "o",
		"ù": "u", "ú": "u", "ụ": "u", "ủ": "u", "ũ": "u", "ư": "u", "ừ": "u", "ứ": "u", "ự": "u", "ử": "u", "ữ": "u",
		"ỳ": "y", "ý": "y", "ỵ": "y", "ỷ": "y", "ỹ": "y",
		"đ": "d",
	}
	for vn, en := range vietnameseMap {
		slug = strings.ReplaceAll(slug, vn, en)
	}

	slug = strings.ReplaceAll(slug, " ", "-")
	reg := regexp.MustCompile("[^a-z0-9-]+")
	slug = reg.ReplaceAllString(slug, "")
	regDash := regexp.MustCompile("-+")
	slug = regDash.ReplaceAllString(slug, "-")
	return strings.Trim(slug, "-")
}
