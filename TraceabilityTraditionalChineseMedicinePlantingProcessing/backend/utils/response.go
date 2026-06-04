package utils

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// Response 统一响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// PaginationResponse 分页响应结构
type PaginationResponse struct {
	List       interface{} `json:"list"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
}

// PaginationQuery 分页查询参数
type PaginationQuery struct {
	Page     int `json:"page" form:"page" query:"page"`
	PageSize int `json:"page_size" form:"page_size" query:"page_size"`
}

const (
	CodeSuccess       = 0
	CodeError         = 1
	CodeBadRequest    = 400
	CodeUnauthorized  = 401
	CodeForbidden     = 403
	CodeNotFound      = 404
	CodeTooManyRequests = 429
	CodeServerError   = 500
)

// Success 成功响应
// c: Echo上下文
// data: 返回的数据
// 返回错误
func Success(c echo.Context, data interface{}) error {
	return c.JSON(http.StatusOK, Response{
		Code:    CodeSuccess,
		Message: "success",
		Data:    data,
	})
}

// SuccessWithMessage 成功响应（带自定义消息）
// c: Echo上下文
// message: 自定义消息
// data: 返回的数据
// 返回错误
func SuccessWithMessage(c echo.Context, message string, data interface{}) error {
	return c.JSON(http.StatusOK, Response{
		Code:    CodeSuccess,
		Message: message,
		Data:    data,
	})
}

// Error 错误响应
// c: Echo上下文
// code: 错误码
// message: 错误消息
// 返回错误
func Error(c echo.Context, code int, message string) error {
	httpStatus := getHTTPStatus(code)

	return c.JSON(httpStatus, Response{
		Code:    code,
		Message: message,
		Data:    nil,
	})
}

// ErrorWithData 错误响应（带数据）
// c: Echo上下文
// code: 错误码
// message: 错误消息
// data: 附加数据
// 返回错误
func ErrorWithData(c echo.Context, code int, message string, data interface{}) error {
	httpStatus := getHTTPStatus(code)

	return c.JSON(httpStatus, Response{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

// BadRequest 参数错误响应
// c: Echo上下文
// message: 错误消息
// 返回错误
func BadRequest(c echo.Context, message string) error {
	if message == "" {
		message = "请求参数错误"
	}
	return Error(c, CodeBadRequest, message)
}

// Unauthorized 未授权响应
// c: Echo上下文
// message: 错误消息
// 返回错误
func Unauthorized(c echo.Context, message string) error {
	if message == "" {
		message = "未授权访问"
	}
	return Error(c, CodeUnauthorized, message)
}

// Forbidden 禁止访问响应
// c: Echo上下文
// message: 错误消息
// 返回错误
func Forbidden(c echo.Context, message string) error {
	if message == "" {
		message = "禁止访问"
	}
	return Error(c, CodeForbidden, message)
}

// NotFound 资源不存在响应
// c: Echo上下文
// message: 错误消息
// 返回错误
func NotFound(c echo.Context, message string) error {
	if message == "" {
		message = "资源不存在"
	}
	return Error(c, CodeNotFound, message)
}

// TooManyRequests 请求过多响应
// c: Echo上下文
// message: 错误消息
// 返回错误
func TooManyRequests(c echo.Context, message string) error {
	if message == "" {
		message = "请求过于频繁，请稍后再试"
	}
	return Error(c, CodeTooManyRequests, message)
}

// ServerError 服务器错误响应
// c: Echo上下文
// message: 错误消息
// 返回错误
func ServerError(c echo.Context, message string) error {
	if message == "" {
		message = "服务器内部错误"
	}
	return Error(c, CodeServerError, message)
}

// Pagination 分页响应
// c: Echo上下文
// list: 数据列表
// total: 总记录数
// page: 当前页码
// pageSize: 每页记录数
// 返回错误
func Pagination(c echo.Context, list interface{}, total int64, page, pageSize int) error {
	totalPages := int(total) / pageSize
	if int(total)%pageSize != 0 {
		totalPages++
	}

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	if pageSize > 100 {
		pageSize = 100
	}

	return c.JSON(http.StatusOK, Response{
		Code:    CodeSuccess,
		Message: "success",
		Data: PaginationResponse{
			List:       list,
			Total:      total,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
	})
}

// PaginationWithMessage 分页响应（带自定义消息）
// c: Echo上下文
// message: 自定义消息
// list: 数据列表
// total: 总记录数
// page: 当前页码
// pageSize: 每页记录数
// 返回错误
func PaginationWithMessage(c echo.Context, message string, list interface{}, total int64, page, pageSize int) error {
	totalPages := int(total) / pageSize
	if int(total)%pageSize != 0 {
		totalPages++
	}

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	if pageSize > 100 {
		pageSize = 100
	}

	return c.JSON(http.StatusOK, Response{
		Code:    CodeSuccess,
		Message: message,
		Data: PaginationResponse{
			List:       list,
			Total:      total,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
	})
}

// GetPaginationParams 获取分页参数
// c: Echo上下文
// defaultPage: 默认页码
// defaultPageSize: 默认每页记录数
// 返回分页参数
func GetPaginationParams(c echo.Context, defaultPage, defaultPageSize int) (int, int) {
	page := c.QueryParam("page")
	pageSize := c.QueryParam("page_size")

	p := defaultPage
	ps := defaultPageSize

	if page != "" {
		if n, err := parsePageInt(page); err == nil && n > 0 {
			p = n
		}
	}

	if pageSize != "" {
		if n, err := parsePageInt(pageSize); err == nil && n > 0 {
			ps = n
		}
	}

	if ps > 100 {
		ps = 100
	}

	return p, ps
}

// parsePageInt 解析页码整数
func parsePageInt(s string) (int, error) {
	var n int
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, nil
		}
		n = n*10 + int(c-'0')
	}
	return n, nil
}

// getHTTPStatus 根据业务错误码获取HTTP状态码
func getHTTPStatus(code int) int {
	switch code {
	case CodeSuccess:
		return http.StatusOK
	case CodeBadRequest:
		return http.StatusBadRequest
	case CodeUnauthorized:
		return http.StatusUnauthorized
	case CodeForbidden:
		return http.StatusForbidden
	case CodeNotFound:
		return http.StatusNotFound
	case CodeTooManyRequests:
		return http.StatusTooManyRequests
	case CodeServerError:
		return http.StatusInternalServerError
	default:
		return http.StatusOK
	}
}

// GetOffset 获取分页偏移量
// page: 页码（从1开始）
// pageSize: 每页记录数
// 返回偏移量
func GetOffset(page, pageSize int) int {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	return (page - 1) * pageSize
}
