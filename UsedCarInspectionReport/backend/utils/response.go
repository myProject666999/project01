package utils

import "github.com/gofiber/fiber/v2"

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type PageData struct {
	List     interface{} `json:"list"`
	Total    int64       `json:"total"`
	Page     int         `json:"page"`
	PageSize int         `json:"pageSize"`
}

func Success(c *fiber.Ctx, data interface{}) error {
	return c.JSON(Response{
		Code:    200,
		Message: "success",
		Data:    data,
	})
}

func SuccessWithMessage(c *fiber.Ctx, data interface{}, message string) error {
	return c.JSON(Response{
		Code:    200,
		Message: message,
		Data:    data,
	})
}

func Error(c *fiber.Ctx, code int, message string) error {
	return c.Status(code).JSON(Response{
		Code:    code,
		Message: message,
		Data:    nil,
	})
}

func PageResult(c *fiber.Ctx, list interface{}, total int64, page, pageSize int) error {
	return c.JSON(Response{
		Code:    200,
		Message: "success",
		Data: PageData{
			List:     list,
			Total:    total,
			Page:     page,
			PageSize: pageSize,
		},
	})
}
