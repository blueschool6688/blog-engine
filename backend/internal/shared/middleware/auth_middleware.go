package middleware

import (
	"strings"

	"backend/internal/auth/service"
	"backend/internal/shared/response"

	"github.com/gofiber/fiber/v2"
)

// JWTGuard returns a Fiber middleware that validates the Bearer token in the
// Authorization header. On success it sets "user_id" and "user_role" in
// c.Locals for downstream handlers.
func JWTGuard(authService *service.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return response.Error(c, fiber.StatusUnauthorized, "Authorization header is required", nil)
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return response.Error(c, fiber.StatusUnauthorized, "Authorization header format must be: Bearer <token>", nil)
		}

		tokenStr := strings.TrimSpace(parts[1])
		if tokenStr == "" {
			return response.Error(c, fiber.StatusUnauthorized, "Token is required", nil)
		}

		claims, err := authService.ValidateToken(tokenStr)
		if err != nil {
			return response.Error(c, fiber.StatusUnauthorized, "Invalid or expired token", nil)
		}

		c.Locals("user_id", claims.UserID)
		c.Locals("user_role", claims.Role)

		return c.Next()
	}
}
