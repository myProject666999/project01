package controllers

import (
	"used_car_inspection/config"
	"used_car_inspection/models"
	"used_car_inspection/utils"

	"github.com/gofiber/fiber/v2"
)

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	Token    string      `json:"token"`
	UserInfo interface{} `json:"userInfo"`
}

func Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "请求参数错误")
	}

	var user models.User
	if err := config.DB.Where("username = ? AND status = 1", req.Username).First(&user).Error; err != nil {
		return utils.Error(c, 401, "用户名或密码错误")
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return utils.Error(c, 401, "用户名或密码错误")
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return utils.Error(c, 500, "生成token失败")
	}

	return utils.Success(c, LoginResponse{
		Token: token,
		UserInfo: fiber.Map{
			"id":       user.ID,
			"username": user.Username,
			"realName": user.RealName,
			"phone":    user.Phone,
			"role":     user.Role,
		},
	})
}

func GetCurrentUser(c *fiber.Ctx) error {
	userId := c.Locals("userId").(uint64)
	var user models.User
	if err := config.DB.Select("id, username, real_name, phone, role").First(&user, userId).Error; err != nil {
		return utils.Error(c, 404, "用户不存在")
	}
	return utils.Success(c, user)
}

func ChangePassword(c *fiber.Ctx) error {
	userId := c.Locals("userId").(uint64)
	var req struct {
		OldPassword string `json:"oldPassword"`
		NewPassword string `json:"newPassword"`
	}
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "参数错误")
	}

	var user models.User
	if err := config.DB.First(&user, userId).Error; err != nil {
		return utils.Error(c, 404, "用户不存在")
	}

	if !utils.CheckPasswordHash(req.OldPassword, user.Password) {
		return utils.Error(c, 400, "原密码错误")
	}

	hashedPassword, _ := utils.HashPassword(req.NewPassword)
	user.Password = hashedPassword
	config.DB.Save(&user)

	return utils.Success(c, nil)
}
