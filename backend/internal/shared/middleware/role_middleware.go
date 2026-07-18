package middleware

import (
	"backend/internal/shared/response"

	"github.com/gofiber/fiber/v2"
)

// RoleGuard returns a Fiber middleware that checks if the authenticated user's role matches requiredRole.
func RoleGuard(requiredRole string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role, ok := c.Locals("user_role").(string)
		if !ok || role != requiredRole {
			return response.Error(c, fiber.StatusForbidden, "You do not have permission to perform this action", nil)
		}
		return c.Next()
	}
}
