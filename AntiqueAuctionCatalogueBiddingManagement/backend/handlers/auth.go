package handlers

import (
	"antique-auction/models"
	"antique-auction/utils"
	"database/sql"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	err := models.DB.QueryRow("SELECT id, username, password, real_name, role, phone, email, status FROM users WHERE username = ?", req.Username).
		Scan(&user.ID, &user.Username, &user.Password, &user.RealName, &user.Role, &user.Phone, &user.Email, &user.Status)

	if err == sql.ErrNoRows {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}
	if err != nil {
		utils.InternalError(c, "数据库错误")
		return
	}

	if user.Status != 1 {
		utils.BadRequest(c, "账号已被禁用")
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.InternalError(c, "生成令牌失败")
		return
	}

	user.Password = ""
	utils.Success(c, LoginResponse{
		Token: token,
		User:  user,
	})
}

func GetCurrentUser(c *gin.Context) {
	userID := c.GetInt("user_id")
	var user models.User
	err := models.DB.QueryRow("SELECT id, username, real_name, role, phone, email, status FROM users WHERE id = ?", userID).
		Scan(&user.ID, &user.Username, &user.RealName, &user.Role, &user.Phone, &user.Email, &user.Status)

	if err != nil {
		utils.InternalError(c, "获取用户信息失败")
		return
	}

	utils.Success(c, user)
}
