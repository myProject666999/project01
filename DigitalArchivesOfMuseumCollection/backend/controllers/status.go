package controllers

import (
	"museum-collection/database"
	"museum-collection/models"
	"museum-collection/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetStatusRecords(c *gin.Context) {
	collectionID := c.Query("collection_id")
	recordType := c.Query("record_type")
	page, pageSize := utils.GetPagination(c)
	
	var records []models.StatusRecord
	var total int64
	
	query := database.DB.Model(&models.StatusRecord{})
	
	if collectionID != "" {
		query = query.Where("collection_id = ?", collectionID)
	}
	if recordType != "" {
		query = query.Where("record_type = ?", recordType)
	}
	
	query.Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("id DESC").Find(&records)
	
	utils.ResponseSuccess(c, gin.H{
		"list":  records,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetStatusRecord(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var record models.StatusRecord
	if err := database.DB.First(&record, id).Error; err != nil {
		utils.ResponseError(c, 404, "记录不存在")
		return
	}
	
	utils.ResponseSuccess(c, record)
}

func CreateStatusRecord(c *gin.Context) {
	var record models.StatusRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		utils.ResponseError(c, 400, "参数错误: "+err.Error())
		return
	}
	
	recorderID := utils.GetUserID(c)
	record.RecorderID = &recorderID
	
	tx := database.DB.Begin()
	
	var collection models.Collection
	if err := tx.First(&collection, record.CollectionID).Error; err == nil {
		record.OldStatus = collection.Status
		if record.NewStatus != "" {
			collection.Status = record.NewStatus
			tx.Save(&collection)
		}
	}
	
	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		utils.ResponseError(c, 500, "创建失败")
		return
	}
	
	tx.Commit()
	utils.ResponseSuccess(c, record)
}

func GetCategories(c *gin.Context) {
	var categories []models.Category
	database.DB.Order("sort_order ASC, id ASC").Find(&categories)
	
	tree := buildCategoryTree(categories, 0)
	utils.ResponseSuccess(c, tree)
}

func CreateCategory(c *gin.Context) {
	var category models.Category
	if err := c.ShouldBindJSON(&category); err != nil {
		utils.ResponseError(c, 400, "参数错误")
		return
	}
	
	if err := database.DB.Create(&category).Error; err != nil {
		utils.ResponseError(c, 500, "创建失败")
		return
	}
	
	utils.ResponseSuccess(c, category)
}

func GetLocations(c *gin.Context) {
	locType := c.Query("type")
	
	var locations []models.Location
	query := database.DB.Where("status = 1")
	
	if locType != "" {
		query = query.Where("type = ?", locType)
	}
	
	query.Order("id ASC").Find(&locations)
	utils.ResponseSuccess(c, locations)
}

func CreateLocation(c *gin.Context) {
	var location models.Location
	if err := c.ShouldBindJSON(&location); err != nil {
		utils.ResponseError(c, 400, "参数错误")
		return
	}
	
	if err := database.DB.Create(&location).Error; err != nil {
		utils.ResponseError(c, 500, "创建失败")
		return
	}
	
	utils.ResponseSuccess(c, location)
}

func buildCategoryTree(categories []models.Category, parentID uint) []map[string]interface{} {
	var result []map[string]interface{}
	
	for _, cat := range categories {
		if cat.ParentID == parentID {
			node := map[string]interface{}{
				"id":    cat.ID,
				"code":  cat.Code,
				"name":  cat.Name,
				"label": cat.Name,
				"value": cat.ID,
			}
			children := buildCategoryTree(categories, cat.ID)
			if len(children) > 0 {
				node["children"] = children
			}
			result = append(result, node)
		}
	}
	
	return result
}
