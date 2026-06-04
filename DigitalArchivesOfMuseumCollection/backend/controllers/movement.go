package controllers

import (
	"museum-collection/database"
	"museum-collection/models"
	"museum-collection/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetMovements(c *gin.Context) {
	page, pageSize := utils.GetPagination(c)
	
	var movements []models.MovementRecord
	var total int64
	
	query := database.DB.Model(&models.MovementRecord{})
	
	if movementType := c.Query("type"); movementType != "" {
		query = query.Where("movement_type = ?", movementType)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if collectionID := c.Query("collection_id"); collectionID != "" {
		query = query.Where("collection_id = ?", collectionID)
	}
	
	query.Count(&total)
	query.Preload("Collection").Offset((page - 1) * pageSize).Limit(pageSize).Order("id DESC").Find(&movements)
	
	utils.ResponseSuccess(c, gin.H{
		"list":  movements,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetMovement(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var movement models.MovementRecord
	if err := database.DB.Preload("Collection").Preload("PackingLists.Items").First(&movement, id).Error; err != nil {
		utils.ResponseError(c, 404, "移动记录不存在")
		return
	}
	
	utils.ResponseSuccess(c, movement)
}

func CreateMovement(c *gin.Context) {
	var movement models.MovementRecord
	if err := c.ShouldBindJSON(&movement); err != nil {
		utils.ResponseError(c, 400, "参数错误: "+err.Error())
		return
	}
	
	movement.MovementNo = utils.GenerateMovementNo()
	movement.Status = "待审批"
	applicantID := utils.GetUserID(c)
	movement.ApplicantID = &applicantID
	
	var collection models.Collection
	if err := database.DB.First(&collection, movement.CollectionID).Error; err == nil {
		movement.FromLocation = collection.CurrentLocation
	}
	
	tx := database.DB.Begin()
	
	if err := tx.Create(&movement).Error; err != nil {
		tx.Rollback()
		utils.ResponseError(c, 500, "创建失败")
		return
	}
	
	tx.Commit()
	utils.ResponseSuccess(c, movement)
}

func ApproveMovement(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var movement models.MovementRecord
	if err := database.DB.First(&movement, id).Error; err != nil {
		utils.ResponseError(c, 404, "移动记录不存在")
		return
	}
	
	if movement.Status != "待审批" {
		utils.ResponseError(c, 400, "当前状态不可审批")
		return
	}
	
	approverID := utils.GetUserID(c)
	now := time.Now()
	
	movement.Status = "已批准"
	movement.ApproverID = &approverID
	movement.ApprovedAt = &now
	
	database.DB.Save(&movement)
	utils.ResponseSuccess(c, movement)
}

func OutHandover(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var movement models.MovementRecord
	if err := database.DB.First(&movement, id).Error; err != nil {
		utils.ResponseError(c, 404, "移动记录不存在")
		return
	}
	
	if movement.Status != "已批准" {
		utils.ResponseError(c, 400, "当前状态不可出库")
		return
	}
	
	handlerID := utils.GetUserID(c)
	now := time.Now()
	
	tx := database.DB.Begin()
	
	movement.Status = "出库中"
	movement.OutHandoverID = &handlerID
	movement.OutHandoverAt = &now
	
	if err := tx.Save(&movement).Error; err != nil {
		tx.Rollback()
		utils.ResponseError(c, 500, "操作失败")
		return
	}
	
	var collection models.Collection
	if err := tx.First(&collection, movement.CollectionID).Error; err == nil {
		collection.Status = getCollectionStatus(movement.MovementType)
		collection.CurrentLocation = movement.ToLocation
		tx.Save(&collection)
	}
	
	tx.Commit()
	utils.ResponseSuccess(c, movement)
}

func InHandover(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var movement models.MovementRecord
	if err := database.DB.First(&movement, id).Error; err != nil {
		utils.ResponseError(c, 404, "移动记录不存在")
		return
	}
	
	if movement.Status != "出库中" {
		utils.ResponseError(c, 400, "当前状态不可入库")
		return
	}
	
	handlerID := utils.GetUserID(c)
	now := time.Now()
	
	tx := database.DB.Begin()
	
	movement.Status = "已完成"
	movement.InHandoverID = &handlerID
	movement.InHandoverAt = &now
	movement.ActualReturnDate = &now
	
	if err := tx.Save(&movement).Error; err != nil {
		tx.Rollback()
		utils.ResponseError(c, 500, "操作失败")
		return
	}
	
	var collection models.Collection
	if err := tx.First(&collection, movement.CollectionID).Error; err == nil {
		collection.Status = "在库"
		collection.CurrentLocation = movement.ToLocation
		tx.Save(&collection)
	}
	
	tx.Commit()
	utils.ResponseSuccess(c, movement)
}

func CreatePackingList(c *gin.Context) {
	var req struct {
		MovementID    uint   `json:"movement_id" binding:"required"`
		BoxNo         string `json:"box_no"`
		CollectionIDs []uint `json:"collection_ids"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ResponseError(c, 400, "参数错误")
		return
	}
	
	packingList := models.PackingList{
		ListNo:          utils.GeneratePackingListNo(),
		MovementID:      req.MovementID,
		BoxNo:           req.BoxNo,
		CollectionCount: len(req.CollectionIDs),
	}
	
	userID := utils.GetUserID(c)
	packingList.CreatedBy = &userID
	
	tx := database.DB.Begin()
	
	if err := tx.Create(&packingList).Error; err != nil {
		tx.Rollback()
		utils.ResponseError(c, 500, "创建失败")
		return
	}
	
	for _, cid := range req.CollectionIDs {
		var collection models.Collection
		if tx.First(&collection, cid).Error == nil {
			item := models.PackingListItem{
				PackingListID:  packingList.ID,
				CollectionID:   cid,
				CollectionNo:   collection.CollectionNo,
				CollectionName: collection.Name,
			}
			tx.Create(&item)
		}
	}
	
	tx.Commit()
	utils.ResponseSuccess(c, packingList)
}

func GetPackingList(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var packingList models.PackingList
	if err := database.DB.Preload("Items").First(&packingList, id).Error; err != nil {
		utils.ResponseError(c, 404, "封箱清单不存在")
		return
	}
	
	utils.ResponseSuccess(c, packingList)
}

func getCollectionStatus(movementType string) string {
	switch movementType {
	case "展出":
		return "展出"
	case "外借":
		return "外借"
	case "修复":
		return "修复中"
	default:
		return "在库"
	}
}
