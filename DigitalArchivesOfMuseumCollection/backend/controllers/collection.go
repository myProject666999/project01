package controllers

import (
	"museum-collection/database"
	"museum-collection/models"
	"museum-collection/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetCollections(c *gin.Context) {
	page, pageSize := utils.GetPagination(c)
	
	var collections []models.Collection
	var total int64
	
	query := database.DB.Model(&models.Collection{})
	
	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("name LIKE ? OR collection_no LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if level := c.Query("level"); level != "" {
		query = query.Where("level = ?", level)
	}
	
	query.Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("id DESC").Find(&collections)
	
	for i := range collections {
		var photos []models.CollectionPhoto
		database.DB.Where("collection_id = ? AND is_primary = 1", collections[i].ID).First(&photos)
		if len(photos) > 0 {
			photos[0].SignedURL = utils.GenerateSignedURL(photos[0].FilePath)
			collections[i].Photos = photos
		}
	}
	
	utils.ResponseSuccess(c, gin.H{
		"list":  collections,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetCollection(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var collection models.Collection
	if err := database.DB.Preload("Photos").Preload("Models3D").First(&collection, id).Error; err != nil {
		utils.ResponseError(c, 404, "藏品不存在")
		return
	}
	
	for i := range collection.Photos {
		collection.Photos[i].SignedURL = utils.GenerateSignedURL(collection.Photos[i].FilePath)
	}
	for i := range collection.Models3D {
		collection.Models3D[i].SignedURL = utils.GenerateSignedURL(collection.Models3D[i].FilePath)
	}
	
	utils.ResponseSuccess(c, collection)
}

func CreateCollection(c *gin.Context) {
	var collection models.Collection
	if err := c.ShouldBindJSON(&collection); err != nil {
		utils.ResponseError(c, 400, "参数错误: "+err.Error())
		return
	}
	
	collection.CollectionNo = utils.GenerateCollectionNo()
	collection.QRCode = collection.CollectionNo
	keeperID := utils.GetUserID(c)
	collection.KeeperID = &keeperID
	
	if err := database.DB.Create(&collection).Error; err != nil {
		utils.ResponseError(c, 500, "创建失败: "+err.Error())
		return
	}
	
	utils.ResponseSuccess(c, collection)
}

func UpdateCollection(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var collection models.Collection
	if err := database.DB.First(&collection, id).Error; err != nil {
		utils.ResponseError(c, 404, "藏品不存在")
		return
	}
	
	if err := c.ShouldBindJSON(&collection); err != nil {
		utils.ResponseError(c, 400, "参数错误")
		return
	}
	
	if err := database.DB.Save(&collection).Error; err != nil {
		utils.ResponseError(c, 500, "更新失败")
		return
	}
	
	utils.ResponseSuccess(c, collection)
}

func DeleteCollection(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	if err := database.DB.Delete(&models.Collection{}, id).Error; err != nil {
		utils.ResponseError(c, 500, "删除失败")
		return
	}
	
	utils.ResponseSuccess(c, nil)
}

func GetCollectionByQR(c *gin.Context) {
	qrCode := c.Param("qr_code")
	
	var collection models.Collection
	if err := database.DB.Where("qr_code = ?", qrCode).First(&collection).Error; err != nil {
		utils.ResponseError(c, 404, "藏品不存在")
		return
	}
	
	utils.ResponseSuccess(c, collection)
}
