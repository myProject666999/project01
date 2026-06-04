package middleware

import (
	"database/sql"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
)

// AntiCrawlConfig 防爬中间件配置
type AntiCrawlConfig struct {
	DB                *sql.DB
	EnableIPBlacklist bool
	EnableUserAgent   bool
	EnableRateMonitor bool
	SuspiciousThreshold int
	AutoBlockIP       bool
	BlockDuration     time.Duration
}

// requestStats 请求统计信息
type requestStats struct {
	count        int
	lastRequest  time.Time
	requestTimes []time.Time
}

// AntiCrawler 防爬实例
type AntiCrawler struct {
	config       AntiCrawlConfig
	requestMap   map[string]*requestStats
	statsMutex   sync.RWMutex
	blockedIPs   map[string]time.Time
	blockMutex   sync.RWMutex
	badUserAgents []*regexp.Regexp
}

var (
	antiCrawlerInstance *AntiCrawler
	antiCrawlerOnce     sync.Once
)

// DefaultAntiCrawlConfig 默认防爬配置
var DefaultAntiCrawlConfig = AntiCrawlConfig{
	EnableIPBlacklist:   true,
	EnableUserAgent:     true,
	EnableRateMonitor:   true,
	SuspiciousThreshold: 60,
	AutoBlockIP:         true,
	BlockDuration:       24 * time.Hour,
}

// NewAntiCrawler 创建防爬实例
func NewAntiCrawler(config AntiCrawlConfig) *AntiCrawler {
	antiCrawlerOnce.Do(func() {
		antiCrawlerInstance = &AntiCrawler{
			config:     config,
			requestMap: make(map[string]*requestStats),
			blockedIPs: make(map[string]time.Time),
		}
		antiCrawlerInstance.initBadUserAgents()
		go antiCrawlerInstance.startCleanupLoop()
	})
	return antiCrawlerInstance
}

// initBadUserAgents 初始化恶意User-Agent正则列表
func (ac *AntiCrawler) initBadUserAgents() {
	badPatterns := []string{
		`(?i)python-requests`,
		`(?i)python-urllib`,
		`(?i)scrapy`,
		`(?i)curl`,
		`(?i)wget`,
		`(?i)httpclient`,
		`(?i)apachebench`,
		`(?i)httrack`,
		`(?i)masscan`,
		`(?i)nmap`,
		`(?i)sqlmap`,
		`(?i)nikto`,
		`(?i)bot`,
		`(?i)spider`,
		`(?i)crawler`,
		`(?i)go-http-client`,
		`(?i)java/`,
		`(?i)php/`,
	}

	for _, pattern := range badPatterns {
		if re, err := regexp.Compile(pattern); err == nil {
			ac.badUserAgents = append(ac.badUserAgents, re)
		}
	}
}

// isIPBlacklisted 检查IP是否在黑名单中
func (ac *AntiCrawler) isIPBlacklisted(ip string) (bool, string) {
	if !ac.config.EnableIPBlacklist || ac.config.DB == nil {
		return false, ""
	}

	var reason string
	var expireAt sql.NullTime

	query := `SELECT reason, expire_at FROM ip_blacklist WHERE ip_address = ?`
	err := ac.config.DB.QueryRow(query, ip).Scan(&reason, &expireAt)

	if err == sql.ErrNoRows {
		return false, ""
	}

	if err != nil {
		return false, ""
	}

	if expireAt.Valid && expireAt.Time.Before(time.Now()) {
		return false, ""
	}

	return true, reason
}

// isBadUserAgent 检查User-Agent是否为恶意爬虫
func (ac *AntiCrawler) isBadUserAgent(userAgent string) bool {
	if !ac.config.EnableUserAgent {
		return false
	}

	if userAgent == "" {
		return true
	}

	for _, re := range ac.badUserAgents {
		if re.MatchString(userAgent) {
			return true
		}
	}

	return false
}

// detectAbnormalAccess 检测异常访问行为
func (ac *AntiCrawler) detectAbnormalAccess(ip string) (bool, string) {
	if !ac.config.EnableRateMonitor {
		return false, ""
	}

	ac.statsMutex.Lock()
	defer ac.statsMutex.Unlock()

	stats, exists := ac.requestMap[ip]
	if !exists {
		stats = &requestStats{
			requestTimes: make([]time.Time, 0, 100),
		}
		ac.requestMap[ip] = stats
	}

	now := time.Now()
	stats.lastRequest = now

	stats.requestTimes = append(stats.requestTimes, now)

	cutoff := now.Add(-1 * time.Minute)
	validTimes := make([]time.Time, 0, len(stats.requestTimes))
	for _, t := range stats.requestTimes {
		if t.After(cutoff) {
			validTimes = append(validTimes, t)
		}
	}
	stats.requestTimes = validTimes
	stats.count = len(validTimes)

	if stats.count >= ac.config.SuspiciousThreshold {
		intervals := make([]time.Duration, 0, len(stats.requestTimes)-1)
		for i := 1; i < len(stats.requestTimes); i++ {
			intervals = append(intervals, stats.requestTimes[i].Sub(stats.requestTimes[i-1]))
		}

		if len(intervals) > 5 {
			avgInterval := time.Duration(0)
			for _, interval := range intervals {
				avgInterval += interval
			}
			avgInterval = avgInterval / time.Duration(len(intervals))

			variance := time.Duration(0)
			for _, interval := range intervals {
				diff := interval - avgInterval
				variance += diff * diff
			}
			variance = variance / time.Duration(len(intervals))

			if variance < 10*time.Millisecond {
				return true, "检测到自动化爬虫行为：请求间隔过于规律"
			}
		}
	}

	return false, ""
}

// blockIP 封禁IP
func (ac *AntiCrawler) blockIP(ip, reason string) error {
	if !ac.config.AutoBlockIP || ac.config.DB == nil {
		return nil
	}

	ac.blockMutex.Lock()
	ac.blockedIPs[ip] = time.Now().Add(ac.config.BlockDuration)
	ac.blockMutex.Unlock()

	expireAt := time.Now().Add(ac.config.BlockDuration)
	query := `INSERT INTO ip_blacklist (ip_address, reason, expire_at) VALUES (?, ?, ?)
	          ON DUPLICATE KEY UPDATE reason = VALUES(reason), expire_at = VALUES(expire_at)`

	_, err := ac.config.DB.Exec(query, ip, reason, expireAt)
	return err
}

// isTemporarilyBlocked 检查是否被临时封禁
func (ac *AntiCrawler) isTemporarilyBlocked(ip string) bool {
	ac.blockMutex.RLock()
	defer ac.blockMutex.RUnlock()

	blockUntil, exists := ac.blockedIPs[ip]
	if !exists {
		return false
	}

	if time.Now().After(blockUntil) {
		delete(ac.blockedIPs, ip)
		return false
	}

	return true
}

// startCleanupLoop 启动清理循环
func (ac *AntiCrawler) startCleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		ac.statsMutex.Lock()
		cutoff := time.Now().Add(-10 * time.Minute)
		for ip, stats := range ac.requestMap {
			if stats.lastRequest.Before(cutoff) {
				delete(ac.requestMap, ip)
			}
		}
		ac.statsMutex.Unlock()

		ac.blockMutex.Lock()
		now := time.Now()
		for ip, blockUntil := range ac.blockedIPs {
			if now.After(blockUntil) {
				delete(ac.blockedIPs, ip)
			}
		}
		ac.blockMutex.Unlock()
	}
}

// AntiCrawl 防爬中间件
// 包含IP黑名单检查、User-Agent验证、请求频率统计、异常访问检测
func AntiCrawl(db *sql.DB) echo.MiddlewareFunc {
	config := DefaultAntiCrawlConfig
	config.DB = db
	return AntiCrawlWithConfig(config)
}

// AntiCrawlWithConfig 使用自定义配置的防爬中间件
func AntiCrawlWithConfig(config AntiCrawlConfig) echo.MiddlewareFunc {
	antiCrawler := NewAntiCrawler(config)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ip := c.RealIP()
			userAgent := c.Request().UserAgent()

			if antiCrawler.isTemporarilyBlocked(ip) {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"code":    403,
					"message": "IP已被临时封禁，请稍后再试",
					"data":    nil,
				})
			}

			blocked, reason := antiCrawler.isIPBlacklisted(ip)
			if blocked {
				c.Set("is_blocked", true)
				c.Set("block_reason", "IP黑名单："+reason)
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"code":    403,
					"message": "访问被拒绝：" + reason,
					"data":    nil,
				})
			}

			if antiCrawler.isBadUserAgent(userAgent) {
				blockReason := "可疑User-Agent：" + userAgent
				c.Set("is_blocked", true)
				c.Set("block_reason", blockReason)

				if config.AutoBlockIP {
					_ = antiCrawler.blockIP(ip, blockReason)
				}

				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"code":    403,
					"message": "访问被拒绝：不支持的客户端",
					"data":    nil,
				})
			}

			abnormal, reason := antiCrawler.detectAbnormalAccess(ip)
			if abnormal {
				c.Set("is_blocked", true)
				c.Set("block_reason", reason)

				if config.AutoBlockIP {
					_ = antiCrawler.blockIP(ip, reason)
				}

				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"code":    403,
					"message": "访问被拒绝：" + reason,
					"data":    nil,
				})
			}

			c.Set("is_blocked", false)
			c.Set("block_reason", "")

			return next(c)
		}
	}
}

// GetClientIP 获取客户端真实IP
func GetClientIP(c echo.Context) string {
	ip := c.Request().Header.Get("X-Forwarded-For")
	if ip != "" {
		ips := strings.Split(ip, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}

	ip = c.Request().Header.Get("X-Real-IP")
	if ip != "" {
		return ip
	}

	return c.RealIP()
}
