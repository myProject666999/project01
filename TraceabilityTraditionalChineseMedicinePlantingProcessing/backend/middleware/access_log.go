package middleware

import (
	"database/sql"
	"time"

	"github.com/labstack/echo/v4"
)

// AccessLogConfig 访问日志配置
type AccessLogConfig struct {
	DB           *sql.DB
	SkipPaths    []string
	MaxLogLength int
	AsyncWrite   bool
	logChannel   chan accessLogEntry
}

// accessLogEntry 访问日志条目
type accessLogEntry struct {
	APIPath       string
	IPAddress     string
	UserAgent     string
	RequestMethod string
	ResponseStatus int
	IsBlocked     int8
	BlockReason   string
	RequestTime   time.Time
}

var defaultAccessLogConfig = AccessLogConfig{
	SkipPaths:    []string{"/health", "/favicon.ico", "/metrics"},
	MaxLogLength: 500,
	AsyncWrite:   true,
	logChannel:   make(chan accessLogEntry, 10000),
}

// AccessLog API访问日志中间件
// 将API访问记录写入api_access_logs表
func AccessLog(db *sql.DB) echo.MiddlewareFunc {
	config := defaultAccessLogConfig
	config.DB = db
	return AccessLogWithConfig(config)
}

// AccessLogWithConfig 使用自定义配置的访问日志中间件
func AccessLogWithConfig(config AccessLogConfig) echo.MiddlewareFunc {
	if config.DB == nil {
		panic("AccessLog middleware requires a database connection")
	}

	if config.AsyncWrite {
		go startLogWriter(config)
	}

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			path := c.Request().URL.Path

			for _, skipPath := range config.SkipPaths {
				if path == skipPath {
					return next(c)
				}
			}

			startTime := time.Now()
			ip := c.RealIP()
			userAgent := c.Request().UserAgent()
			method := c.Request().Method

			if len(userAgent) > config.MaxLogLength {
				userAgent = userAgent[:config.MaxLogLength]
			}

			err := next(c)

			responseStatus := c.Response().Status
			if err != nil {
				if he, ok := err.(*echo.HTTPError); ok {
					responseStatus = he.Code
				}
			}

			isBlocked, _ := c.Get("is_blocked").(bool)
			blockReason, _ := c.Get("block_reason").(string)

			if len(blockReason) > 200 {
				blockReason = blockReason[:200]
			}

			entry := accessLogEntry{
				APIPath:        path,
				IPAddress:      ip,
				UserAgent:      userAgent,
				RequestMethod:  method,
				ResponseStatus: responseStatus,
				IsBlocked:      boolToTinyInt(isBlocked),
				BlockReason:    blockReason,
				RequestTime:    startTime,
			}

			if config.AsyncWrite {
				select {
				case config.logChannel <- entry:
				default:
				}
			} else {
				writeAccessLog(config.DB, entry)
			}

			return err
		}
	}
}

// startLogWriter 启动异步日志写入协程
func startLogWriter(config AccessLogConfig) {
	for entry := range config.logChannel {
		writeAccessLog(config.DB, entry)
	}
}

// writeAccessLog 写入访问日志到数据库
func writeAccessLog(db *sql.DB, entry accessLogEntry) {
	query := `INSERT INTO api_access_logs 
		(api_path, ip_address, user_agent, request_method, response_status, is_blocked, block_reason, request_time)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := db.Exec(query,
		entry.APIPath,
		entry.IPAddress,
		entry.UserAgent,
		entry.RequestMethod,
		entry.ResponseStatus,
		entry.IsBlocked,
		entry.BlockReason,
		entry.RequestTime,
	)

	if err != nil {
	}
}

// boolToTinyInt 将bool转换为TINYINT(0或1)
func boolToTinyInt(b bool) int8 {
	if b {
		return 1
	}
	return 0
}

// AccessLogSkipPath 添加需要跳过日志记录的路径
func AccessLogSkipPath(config *AccessLogConfig, path string) {
	for _, p := range config.SkipPaths {
		if p == path {
			return
		}
	}
	config.SkipPaths = append(config.SkipPaths, path)
}
