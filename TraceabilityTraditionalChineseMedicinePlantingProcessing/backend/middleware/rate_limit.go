package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/time/rate"

	"tcm-traceability/config"
)

// IPRateLimiter IP限流配置
type IPRateLimiter struct {
	minuteLimiter map[string]*rate.Limiter
	hourLimiter   map[string]*rate.Limiter
	mu             sync.RWMutex
	minuteLimit   rate.Limit
	minuteBurst   int
	hourLimit     rate.Limit
	hourBurst     int
	cleanupTicker *time.Ticker
}

// visitor 访问者信息
type visitor struct {
	minuteLimiter *rate.Limiter
	hourLimiter   *rate.Limiter
	lastSeen      time.Time
}

var (
	rateLimiterInstance *IPRateLimiter
	rateLimiterOnce     sync.Once
)

// NewIPRateLimiter 创建IP限流实例
func NewIPRateLimiter() *IPRateLimiter {
	rateLimiterOnce.Do(func() {
		rateLimiterInstance = &IPRateLimiter{
			minuteLimiter: make(map[string]*rate.Limiter),
			hourLimiter:   make(map[string]*rate.Limiter),
			minuteLimit: rate.Every(time.Minute / time.Duration(config.AppConfig.RateLimitPerMinute)),
			minuteBurst: config.AppConfig.RateLimitPerMinute,
			hourLimit:   rate.Every(time.Hour / time.Duration(config.AppConfig.RateLimitPerHour)),
			hourBurst:   config.AppConfig.RateLimitPerHour,
		}
		go rateLimiterInstance.startCleanupLoop()
	})
	return rateLimiterInstance
}

// getLimiter 获取指定IP的限流器
func (rl *IPRateLimiter) getLimiter(ip string) (*rate.Limiter, *rate.Limiter) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	minuteLimiter, exists := rl.minuteLimiter[ip]
	if !exists {
		minuteLimiter = rate.NewLimiter(rl.minuteLimit, rl.minuteBurst)
		rl.minuteLimiter[ip] = minuteLimiter
	}

	hourLimiter, exists := rl.hourLimiter[ip]
	if !exists {
		hourLimiter = rate.NewLimiter(rl.hourLimit, rl.hourBurst)
		rl.hourLimiter[ip] = hourLimiter
	}

	return minuteLimiter, hourLimiter
}

// startCleanupLoop 启动清理循环，定期清理不活跃的IP记录
func (rl *IPRateLimiter) startCleanupLoop() {
	rl.cleanupTicker = time.NewTicker(10 * time.Minute)
	defer rl.cleanupTicker.Stop()

	for range rl.cleanupTicker.C {
		rl.mu.Lock()
		for ip := range rl.minuteLimiter {
			delete(rl.minuteLimiter, ip)
			delete(rl.hourLimiter, ip)
		}
		rl.mu.Unlock()
	}
}

// allow 检查IP是否允许访问
func (rl *IPRateLimiter) allow(ip string) (bool, string) {
	minuteLimiter, hourLimiter := rl.getLimiter(ip)

	if !minuteLimiter.Allow() {
		return false, "每分钟请求次数过多，请稍后再试"
	}

	if !hourLimiter.Allow() {
		return false, "每小时请求次数过多，请稍后再试"
	}

	return true, ""
}

// RateLimit 限流中间件
// 基于IP的限流中间件，用于扫码查询接口的防爬
// 默认配置：每分钟30次，每小时100次，超过限制返回429
func RateLimit() echo.MiddlewareFunc {
	limiter := NewIPRateLimiter()

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ip := c.RealIP()

			allowed, reason := limiter.allow(ip)
			if !allowed {
				return c.JSON(http.StatusTooManyRequests, map[string]interface{}{
					"code":    429,
					"message": reason,
					"data":    nil,
				})
			}

			return next(c)
		}
	}
}

// RateLimitWithConfig 使用自定义配置的限流中间件
func RateLimitWithConfig(perMinute, perHour int) echo.MiddlewareFunc {
	limiter := &IPRateLimiter{
		minuteLimiter: make(map[string]*rate.Limiter),
		hourLimiter:   make(map[string]*rate.Limiter),
		minuteLimit: rate.Every(time.Minute / time.Duration(perMinute)),
		minuteBurst: perMinute,
		hourLimit:   rate.Every(time.Hour / time.Duration(perHour)),
		hourBurst:   perHour,
	}
	go limiter.startCleanupLoop()

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ip := c.RealIP()

			allowed, reason := limiter.allow(ip)
			if !allowed {
				return c.JSON(http.StatusTooManyRequests, map[string]interface{}{
					"code":    429,
					"message": reason,
					"data":    nil,
				})
			}

			return next(c)
		}
	}
}
