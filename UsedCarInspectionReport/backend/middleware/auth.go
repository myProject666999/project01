package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"usedcarinspectionreport/utils"
)

type UserClaims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
}

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, utils.Error(401, "未提供认证令牌"))
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, utils.Error(401, "认证令牌格式错误"))
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, utils.Error(401, "认证令牌无效或已过期"))
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func AdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, utils.Error(403, "需要管理员权限"))
			c.Abort()
			return
		}
		c.Next()
	}
}
