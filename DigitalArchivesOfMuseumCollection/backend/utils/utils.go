package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"museum-collection/config"
	"museum-collection/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GenerateSignedURL(filePath string) string {
	cfg := config.LoadConfig()
	expireTime := time.Now().Add(2 * time.Hour).Unix()
	
	signData := fmt.Sprintf("%s%d", filePath, expireTime)
	mac := hmac.New(sha256.New, []byte(cfg.JWTSecret))
	mac.Write([]byte(signData))
	signature := hex.EncodeToString(mac.Sum(nil))
	
	return fmt.Sprintf("/api/files/%s?expire=%d&sign=%s", filePath, expireTime, signature)
}

func VerifySignedURL(filePath string, expire int64, sign string) bool {
	if time.Now().Unix() > expire {
		return false
	}
	
	cfg := config.LoadConfig()
	signData := fmt.Sprintf("%s%d", filePath, expire)
	mac := hmac.New(sha256.New, []byte(cfg.JWTSecret))
	mac.Write([]byte(signData))
	expectedSign := hex.EncodeToString(mac.Sum(nil))
	
	return hmac.Equal([]byte(sign), []byte(expectedSign))
}

func GenerateCollectionNo() string {
	now := time.Now()
	return fmt.Sprintf("C%s%06d", now.Format("20060102"), uuid.New().ID()%1000000)
}

func GenerateMovementNo() string {
	now := time.Now()
	return fmt.Sprintf("M%s%06d", now.Format("20060102"), uuid.New().ID()%1000000)
}

func GeneratePlanNo() string {
	now := time.Now()
	return fmt.Sprintf("P%s%06d", now.Format("20060102"), uuid.New().ID()%1000000)
}

func GeneratePackingListNo() string {
	now := time.Now()
	return fmt.Sprintf("PL%s%06d", now.Format("20060102"), uuid.New().ID()%1000000)
}

func ResponseSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, models.Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

func ResponseError(c *gin.Context, code int, message string) {
	c.JSON(http.StatusOK, models.Response{
		Code:    code,
		Message: message,
	})
}

func GetUserID(c *gin.Context) uint {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0
	}
	return userID.(uint)
}

func GetPagination(c *gin.Context) (int, int) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	
	return page, pageSize
}
