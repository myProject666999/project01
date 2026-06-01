package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func Success(c echo.Context, data interface{}) error {
	return c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

func Error(c echo.Context, statusCode int, msg string) error {
	return c.JSON(statusCode, Response{
		Code:    statusCode,
		Message: msg,
		Data:    nil,
	})
}

func GetUserID(c echo.Context) uint {
	id, _ := c.Get("user_id").(float64)
	return uint(id)
}
