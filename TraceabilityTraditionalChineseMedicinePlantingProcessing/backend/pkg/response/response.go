package response

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type PaginatedResponse struct {
	Total    int64       `json:"total"`
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
	List     interface{} `json:"list"`
}

func Success(c echo.Context, data interface{}) error {
	return c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

func SuccessWithPaginated(c echo.Context, list interface{}, total int64, page, pageSize int) error {
	return c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data: PaginatedResponse{
			Total:    total,
			Page:     page,
			PageSize: pageSize,
			List:     list,
		},
	})
}

func Error(c echo.Context, code int, message string) error {
	return c.JSON(http.StatusOK, Response{
		Code:    code,
		Message: message,
	})
}

func BadRequest(c echo.Context, message string) error {
	return Error(c, http.StatusBadRequest, message)
}

func NotFound(c echo.Context, message string) error {
	return Error(c, http.StatusNotFound, message)
}

func InternalServerError(c echo.Context, message string) error {
	return Error(c, http.StatusInternalServerError, message)
}
