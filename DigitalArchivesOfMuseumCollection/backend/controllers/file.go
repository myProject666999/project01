package controllers

import (
	"fmt"
	"museum-collection/config"
	"museum-collection/database"
	"museum-collection/models"
	"museum-collection/utils"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UploadPhoto(c *gin.Context) {
	collectionID, _ := strconv.ParseUint(c.PostForm("collection_id"), 10, 32)
	angle := c.PostForm("angle")
	isPrimary, _ := strconv.ParseBool(c.PostForm("is_primary"))
	
	file, err := c.FormFile("file")
	if err != nil {
		utils.ResponseError(c, 400, "获取文件失败")
		return
	}
	
	cfg := config.LoadConfig()
	
	ext := filepath.Ext(file.Filename)
	newFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	dateDir := time.Now().Format("2006/01/02")
	relativePath := fmt.Sprintf("photos/%s/%s", dateDir, newFileName)
	fullPath := fmt.Sprintf("%s/%s", cfg.UploadPath, relativePath)
	
	if err := c.SaveUploadedFile(file, fullPath); err != nil {
		utils.ResponseError(c, 500, "保存文件失败")
		return
	}
	
	uploadedBy := utils.GetUserID(c)
	photo := models.CollectionPhoto{
		CollectionID: uint(collectionID),
		FileName:     file.Filename,
		FilePath:     relativePath,
		FileSize:     file.Size,
		FileType:     file.Header.Get("Content-Type"),
		Angle:        angle,
		IsPrimary:    0,
		UploadedBy:   &uploadedBy,
	}
	if isPrimary {
		photo.IsPrimary = 1
		database.DB.Model(&models.CollectionPhoto{}).Where("collection_id = ?", collectionID).Update("is_primary", 0)
	}
	
	if err := database.DB.Create(&photo).Error; err != nil {
		utils.ResponseError(c, 500, "保存记录失败")
		return
	}
	
	photo.SignedURL = utils.GenerateSignedURL(photo.FilePath)
	utils.ResponseSuccess(c, photo)
}

func Upload3DModel(c *gin.Context) {
	collectionID, _ := strconv.ParseUint(c.PostForm("collection_id"), 10, 32)
	description := c.PostForm("description")
	
	file, err := c.FormFile("file")
	if err != nil {
		utils.ResponseError(c, 400, "获取文件失败")
		return
	}
	
	cfg := config.LoadConfig()
	
	ext := filepath.Ext(file.Filename)
	newFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	dateDir := time.Now().Format("2006/01/02")
	relativePath := fmt.Sprintf("3dmodels/%s/%s", dateDir, newFileName)
	fullPath := fmt.Sprintf("%s/%s", cfg.UploadPath, relativePath)
	
	if err := c.SaveUploadedFile(file, fullPath); err != nil {
		utils.ResponseError(c, 500, "保存文件失败")
		return
	}
	
	uploadedBy := utils.GetUserID(c)
	model := models.Collection3DModel{
		CollectionID: uint(collectionID),
		FileName:     file.Filename,
		FilePath:     relativePath,
		FileSize:     file.Size,
		FileFormat:   ext[1:],
		Description:  description,
		UploadedBy:   &uploadedBy,
	}
	
	if err := database.DB.Create(&model).Error; err != nil {
		utils.ResponseError(c, 500, "保存记录失败")
		return
	}
	
	model.SignedURL = utils.GenerateSignedURL(model.FilePath)
	utils.ResponseSuccess(c, model)
}

func GetFile(c *gin.Context) {
	filePath := c.Param("filepath")
	expire, _ := strconv.ParseInt(c.Query("expire"), 10, 64)
	sign := c.Query("sign")
	
	if !utils.VerifySignedURL(filePath, expire, sign) {
		utils.ResponseError(c, 403, "文件链接无效或已过期")
		return
	}
	
	cfg := config.LoadConfig()
	fullPath := fmt.Sprintf("%s/%s", cfg.UploadPath, filePath)
	c.File(fullPath)
}

func DeletePhoto(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	if err := database.DB.Delete(&models.CollectionPhoto{}, id).Error; err != nil {
		utils.ResponseError(c, 500, "删除失败")
		return
	}
	
	utils.ResponseSuccess(c, nil)
}

func Delete3DModel(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	if err := database.DB.Delete(&models.Collection3DModel{}, id).Error; err != nil {
		utils.ResponseError(c, 500, "删除失败")
		return
	}
	
	utils.ResponseSuccess(c, nil)
}

func GetStatistics(c *gin.Context) {
	var totalCollections int64
	database.DB.Model(&models.Collection{}).Count(&totalCollections)
	
	statusCounts := make(map[string]int64)
	rows, _ := database.DB.Model(&models.Collection{}).Select("status, COUNT(*) as count").Group("status").Rows()
	for rows.Next() {
		var status string
		var count int64
		rows.Scan(&status, &count)
		statusCounts[status] = count
	}
	
	levelCounts := make(map[string]int64)
	rows, _ = database.DB.Model(&models.Collection{}).Select("level, COUNT(*) as count").Group("level").Rows()
	for rows.Next() {
		var level string
		var count int64
		rows.Scan(&level, &count)
		levelCounts[level] = count
	}
	
	var pendingMovements int64
	database.DB.Model(&models.MovementRecord{}).Where("status = ?", "待审批").Count(&pendingMovements)
	
	var ongoingInventory int64
	database.DB.Model(&models.InventoryPlan{}).Where("status = ?", "进行中").Count(&ongoingInventory)
	
	utils.ResponseSuccess(c, gin.H{
		"total_collections":  totalCollections,
		"status_counts":      statusCounts,
		"level_counts":       levelCounts,
		"pending_movements":  pendingMovements,
		"ongoing_inventory":  ongoingInventory,
	})
}
