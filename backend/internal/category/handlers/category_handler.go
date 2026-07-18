package handlers

import (
	"context"
	"regexp"
	"strconv"
	"strings"

	"backend/internal/category/models"
	"backend/internal/category/repository"
	"backend/internal/shared/response"
	"backend/internal/shared/validator"

	"github.com/gofiber/fiber/v2"

)

type CategoryHandler struct {
	repo *repository.CategoryRepository
}

func NewCategoryHandler(repo *repository.CategoryRepository) *CategoryHandler {
	return &CategoryHandler{
		repo: repo,
	}
}

type CreateCategoryRequest struct {
	Name        string `json:"name" validate:"required"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
}

type UpdateCategoryRequest struct {
	Name        string `json:"name" validate:"required"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
}


func (h *CategoryHandler) List(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	categories, err := h.repo.FindAll(ctx)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve categories", err.Error())
	}
	return response.Success(c, fiber.StatusOK, categories, "Categories retrieved successfully")
}

func (h *CategoryHandler) Create(c *fiber.Ctx) error {
	var req CreateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if err := validator.Validate(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Validation failed", err)
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
		return response.Error(c, fiber.StatusBadRequest, "Category with this slug already exists", nil)
	}

	category := &models.Category{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
	}

	if err := h.repo.Insert(ctx, category); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to create category", err.Error())
	}

	return response.Success(c, fiber.StatusCreated, category, "Category created successfully")
}

func (h *CategoryHandler) Update(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid category ID", err.Error())
	}

	var req UpdateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if err := validator.Validate(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Validation failed", err)
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

	category, err := h.repo.FindByID(ctx, uint(id))
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "Category not found", err.Error())
	}

	if category.Slug != slug {
		existing, err := h.repo.FindBySlug(ctx, slug)
		if err == nil && existing != nil {
			return response.Error(c, fiber.StatusBadRequest, "Category with this slug already exists", nil)
		}
	}

	category.Name = req.Name
	category.Slug = slug
	category.Description = req.Description

	if err := h.repo.Update(ctx, category); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to update category", err.Error())
	}

	return response.Success(c, fiber.StatusOK, category, "Category updated successfully")
}

func (h *CategoryHandler) Delete(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid category ID", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	if err := h.repo.Delete(ctx, uint(id)); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to delete category", err.Error())
	}

	return response.Success(c, fiber.StatusOK, nil, "Category deleted successfully")
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
