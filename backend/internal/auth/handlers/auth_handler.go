package handlers

import (
	"context"
	"time"

	auditService "backend/internal/audit/service"
	"backend/internal/auth/service"
	"backend/internal/shared/response"
	"backend/internal/shared/validator"

	"github.com/gofiber/fiber/v2"
)

// loginRequest is the expected JSON body for POST /auth/login.
type loginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type forgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type resetPasswordRequest struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=6"`
}

// AuthHandler exposes HTTP handlers for authentication endpoints.
type AuthHandler struct {
	authService *service.AuthService
	auditSvc    *auditService.AuditService
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(authService *service.AuthService, auditSvc *auditService.AuditService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		auditSvc:    auditSvc,
	}
}

// Login handles POST /auth/login.
// On success it sets an HttpOnly refresh_token cookie and returns the access token + user object.
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req loginRequest
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

	pair, user, err := h.authService.Login(ctx, req.Email, req.Password)
	if err != nil {
		return response.Error(c, fiber.StatusUnauthorized, err.Error(), nil)
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    pair.RefreshToken,
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		Path:     "/",
	})

	h.auditSvc.Log(&user.ID, "login", "user", &user.ID, nil, c.IP())

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"access_token": pair.AccessToken,
		"user":         user,
	}, "Login successful")
}

// Refresh handles POST /auth/refresh.
// Reads the refresh_token cookie, issues a new TokenPair, rotates the cookie.
func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	refreshTokenStr := c.Cookies("refresh_token")
	if refreshTokenStr == "" {
		return response.Error(c, fiber.StatusUnauthorized, "Refresh token not found", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	pair, err := h.authService.RefreshToken(ctx, refreshTokenStr)
	if err != nil {
		return response.Error(c, fiber.StatusUnauthorized, "Invalid or expired refresh token", err.Error())
	}

	// Rotate the cookie.
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    pair.RefreshToken,
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		Path:     "/",
	})

	return response.Success(c, fiber.StatusOK, fiber.Map{
		"access_token": pair.AccessToken,
	}, "Token refreshed successfully")
}

// Logout handles POST /auth/logout.
// Clears the refresh_token cookie by setting it to an expired value.
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
		Expires:  time.Unix(0, 0),
		Path:     "/",
	})

	return response.Success(c, fiber.StatusOK, nil, "Logged out successfully")
}

// Me handles GET /auth/me.
// Returns the authenticated user's profile, resolved from the JWT via the JWTGuard middleware.
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok || userID == 0 {
		return response.Error(c, fiber.StatusUnauthorized, "Unauthorized", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	user, err := h.authService.GetUserByID(ctx, userID)
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "User not found", err.Error())
	}

	return response.Success(c, fiber.StatusOK, user, "User profile retrieved successfully")
}

type updateProfileRequest struct {
	Name      string `json:"name" validate:"required"`
	Nickname  string `json:"nickname" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
	AvatarURL string `json:"avatar_url"`
	Bio       string `json:"bio"`
}

type changePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=6"`
}

// UpdateProfile handles PUT /api/auth/me.
func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok || userID == 0 {
		return response.Error(c, fiber.StatusUnauthorized, "Unauthorized", nil)
	}

	var req updateProfileRequest
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

	user, err := h.authService.UpdateProfile(ctx, userID, req.Name, req.Nickname, req.Email, req.AvatarURL, req.Bio)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to update profile", err.Error())
	}

	h.auditSvc.Log(&userID, "update_profile", "user", &userID, req, c.IP())

	return response.Success(c, fiber.StatusOK, user, "Profile updated successfully")
}

// ChangePassword handles PUT /api/auth/password.
func (h *AuthHandler) ChangePassword(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok || userID == 0 {
		return response.Error(c, fiber.StatusUnauthorized, "Unauthorized", nil)
	}

	var req changePasswordRequest
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

	err := h.authService.ChangePassword(ctx, userID, req.OldPassword, req.NewPassword)
	if err != nil {
		if err.Error() == "incorrect old password" {
			return response.Error(c, fiber.StatusBadRequest, err.Error(), nil)
		}
		return response.Error(c, fiber.StatusInternalServerError, "Failed to change password", err.Error())
	}

	return response.Success(c, fiber.StatusOK, nil, "Password changed successfully")
}

// ForgotPassword handles POST /auth/forgot-password.
func (h *AuthHandler) ForgotPassword(c *fiber.Ctx) error {
	var req forgotPasswordRequest
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

	// Always return success even if user not found to prevent email enumeration
	_ = h.authService.ForgotPassword(ctx, req.Email)

	return response.Success(c, fiber.StatusOK, nil, "If the email is registered, a password reset link has been sent.")
}

// ResetPassword handles POST /auth/reset-password.
func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	var req resetPasswordRequest
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

	err := h.authService.ResetPassword(ctx, req.Token, req.NewPassword)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	return response.Success(c, fiber.StatusOK, nil, "Password has been reset successfully.")
}
