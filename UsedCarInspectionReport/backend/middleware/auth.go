package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"used_car_inspection/utils"
)

func JWTAuth(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{
			"code":    401,
			"message": "未提供认证令牌",
		})
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if !(len(parts) == 2 && parts[0] == "Bearer") {
		return c.Status(401).JSON(fiber.Map{
			"code":    401,
			"message": "认证令牌格式错误",
		})
	}

	claims, err := utils.ParseToken(parts[1])
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"code":    401,
			"message": "认证令牌无效或已过期",
		})
	}

	c.Locals("userId", claims.UserID)
	c.Locals("username", claims.Username)
	c.Locals("role", claims.Role)
	return c.Next()
}

func AdminAuth(c *fiber.Ctx) error {
	role := c.Locals("role")
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{
			"code":    403,
			"message": "需要管理员权限",
		})
	}
	return c.Next()
}
