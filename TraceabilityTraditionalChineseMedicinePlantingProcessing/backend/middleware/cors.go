package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// CORSConfig CORS中间件配置
type CORSConfig struct {
	AllowOrigins []string
	AllowMethods []string
	AllowHeaders []string
}

// DefaultCORSConfig 默认CORS配置
var DefaultCORSConfig = CORSConfig{
	AllowOrigins: []string{"*"},
	AllowMethods: []string{
		http.MethodGet,
		http.MethodPost,
		http.MethodPut,
		http.MethodDelete,
		http.MethodOptions,
		http.MethodPatch,
	},
	AllowHeaders: []string{
		echo.HeaderOrigin,
		echo.HeaderContentType,
		echo.HeaderAccept,
		echo.HeaderAuthorization,
		echo.HeaderXRequestedWith,
	},
}

// CORS 跨域资源共享中间件
// 处理跨域请求，支持预检请求（OPTIONS）
func CORS() echo.MiddlewareFunc {
	return CORSWithConfig(DefaultCORSConfig)
}

// CORSWithConfig 使用自定义配置创建CORS中间件
func CORSWithConfig(config CORSConfig) echo.MiddlewareFunc {
	return middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     config.AllowOrigins,
		AllowMethods:     config.AllowMethods,
		AllowHeaders:     config.AllowHeaders,
		AllowCredentials: true,
		MaxAge:           86400,
	})
}

// RestrictedCORS 限制跨域来源的中间件
// 只允许指定的域名访问，适用于生产环境
func RestrictedCORS(allowedOrigins []string) echo.MiddlewareFunc {
	config := DefaultCORSConfig
	config.AllowOrigins = allowedOrigins
	return CORSWithConfig(config)
}
