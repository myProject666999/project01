package controllers

import (
	"museum-collection/database"
	"museum-collection/middleware"
	"museum-collection/models"
	"museum-collection/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ResponseError(c, 400, "参数错误")
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.ResponseError(c, 401, "用户名或密码错误")
		return
	}

	if user.Status != 1 {
		utils.ResponseError(c, 401, "账户已被禁用")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.ResponseError(c, 401, "用户名或密码错误")
		return
	}

	token, err := middleware.GenerateToken(&user)
	if err != nil {
		utils.ResponseError(c, 500, "生成令牌失败")
		return
	}

	utils.ResponseSuccess(c, models.LoginResponse{
		Token: token,
		User:  &user,
	})
}

func GetCurrentUser(c *gin.Context) {
	userID := utils.GetUserID(c)
	
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.ResponseError(c, 404, "用户不存在")
		return
	}

	utils.ResponseSuccess(c, user)
}

func ChangePassword(c *gin.Context) {
	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ResponseError(c, 400, "参数错误")
		return
	}

	userID := utils.GetUserID(c)
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.ResponseError(c, 404, "用户不存在")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		utils.ResponseError(c, 400, "原密码错误")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		utils.ResponseError(c, 500, "密码加密失败")
		return
	}

	database.DB.Model(&user).Update("password", string(hashedPassword))
	utils.ResponseSuccess(c, nil)
}
