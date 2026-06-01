package handler

import (
	"net/http"
	"server/service"

	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type RegisterRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type LoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

func (h *AuthHandler) Register(c echo.Context) error {
	req := new(RegisterRequest)
	if err := c.Bind(req); err != nil {
		return Error(c, http.StatusBadRequest, "请求参数错误")
	}
	if req.Phone == "" || req.Password == "" || req.Name == "" {
		return Error(c, http.StatusBadRequest, "手机号、密码和姓名不能为空")
	}
	user, err := h.authService.Register(req.Phone, req.Password, req.Name)
	if err != nil {
		return Error(c, http.StatusBadRequest, err.Error())
	}
	return Success(c, user)
}

func (h *AuthHandler) Login(c echo.Context) error {
	req := new(LoginRequest)
	if err := c.Bind(req); err != nil {
		return Error(c, http.StatusBadRequest, "请求参数错误")
	}
	if req.Phone == "" || req.Password == "" {
		return Error(c, http.StatusBadRequest, "手机号和密码不能为空")
	}
	token, user, err := h.authService.Login(req.Phone, req.Password)
	if err != nil {
		return Error(c, http.StatusUnauthorized, err.Error())
	}
	return Success(c, LoginResponse{Token: token, User: user})
}

func (h *AuthHandler) Profile(c echo.Context) error {
	userID := GetUserID(c)
	user, err := h.authService.GetProfile(userID)
	if err != nil {
		return Error(c, http.StatusNotFound, "用户不存在")
	}
	return Success(c, user)
}
