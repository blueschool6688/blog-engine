package handlers

import (
	"context"
	"strconv"

	"backend/internal/auth/service"
	"backend/internal/shared/response"
	"backend/internal/shared/validator"

	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	authService *service.AuthService
}

func NewUserHandler(authService *service.AuthService) *UserHandler {
	return &UserHandler{authService: authService}
}

type createUserRequest struct {
	Name     string `json:"name" validate:"required"`
	Nickname string `json:"nickname" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Role     string `json:"role" validate:"required,oneof=admin editor"`
}

type updateUserRequest struct {
	Name     string `json:"name" validate:"required"`
	Nickname string `json:"nickname" validate:"required"`
	Role     string `json:"role" validate:"required,oneof=admin editor"`
	IsActive bool   `json:"is_active"`
}

// List handles GET /api/users
func (h *UserHandler) List(c *fiber.Ctx) error {
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil || offset < 0 {
		offset = 0
	}
	limit, err := strconv.Atoi(c.Query("limit", "10"))
	if err != nil || limit <= 0 {
		limit = 10
	}
	role := c.Query("role", "")

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	users, total, err := h.authService.ListUsers(ctx, offset, limit, role)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to list users", err.Error())
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"items": users,
		"total": total,
	}, "Users listed successfully")
}

// Create handles POST /api/users
func (h *UserHandler) Create(c *fiber.Ctx) error {
	var req createUserRequest
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

	user, err := h.authService.CreateUser(ctx, req.Name, req.Nickname, req.Email, req.Password, req.Role)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(c, fiber.StatusCreated, user, "User created successfully")
}

// Update handles PUT /api/users/:id
func (h *UserHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid user ID", nil)
	}

	var req updateUserRequest
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

	user, err := h.authService.UpdateUser(ctx, uint(id), req.Name, req.Nickname, req.Role, req.IsActive)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to update user", err.Error())
	}

	return response.Success(c, fiber.StatusOK, user, "User updated successfully")
}

// Delete handles DELETE /api/users/:id
func (h *UserHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid user ID", nil)
	}

	callerID, ok := c.Locals("user_id").(uint)
	if !ok {
		return response.Error(c, fiber.StatusUnauthorized, "Unauthorized", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	err = h.authService.DeleteUser(ctx, callerID, uint(id))
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(c, fiber.StatusOK, nil, "User deleted successfully")
}
