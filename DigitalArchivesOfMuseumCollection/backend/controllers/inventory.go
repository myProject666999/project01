package controllers

import (
	"museum-collection/database"
	"museum-collection/models"
	"museum-collection/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetInventoryPlans(c *gin.Context) {
	page, pageSize := utils.GetPagination(c)
	
	var plans []models.InventoryPlan
	var total int64
	
	query := database.DB.Model(&models.InventoryPlan{})
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("id DESC").Find(&plans)
	
	utils.ResponseSuccess(c, gin.H{
		"list":  plans,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetInventoryPlan(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var plan models.InventoryPlan
	if err := database.DB.Preload("Items").First(&plan, id).Error; err != nil {
		utils.ResponseError(c, 404, "盘点计划不存在")
		return
	}
	
	utils.ResponseSuccess(c, plan)
}

func CreateInventoryPlan(c *gin.Context) {
	var plan models.InventoryPlan
	if err := c.ShouldBindJSON(&plan); err != nil {
		utils.ResponseError(c, 400, "参数错误: "+err.Error())
		return
	}
	
	plan.PlanNo = utils.GeneratePlanNo()
	plan.Status = "待执行"
	creatorID := utils.GetUserID(c)
	plan.CreatorID = &creatorID
	
	tx := database.DB.Begin()
	
	if err := tx.Create(&plan).Error; err != nil {
		tx.Rollback()
		utils.ResponseError(c, 500, "创建失败")
		return
	}
	
	var collections []models.Collection
	query := tx.Model(&models.Collection{})
	
	if plan.LocationScope != "" {
		query = query.Where("current_location LIKE ?", "%"+plan.LocationScope+"%")
	}
	
	query.Find(&collections)
	plan.TotalCount = len(collections)
	
	for _, col := range collections {
		item := models.InventoryItem{
			PlanID:           plan.ID,
			CollectionID:     col.ID,
			CollectionNo:     col.CollectionNo,
			CollectionName:   col.Name,
			ExpectedLocation: col.CurrentLocation,
			Status:           "待盘点",
		}
		tx.Create(&item)
	}
	
	tx.Save(&plan)
	tx.Commit()
	
	utils.ResponseSuccess(c, plan)
}

func StartInventory(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var plan models.InventoryPlan
	if err := database.DB.First(&plan, id).Error; err != nil {
		utils.ResponseError(c, 404, "盘点计划不存在")
		return
	}
	
	if plan.Status != "待执行" {
		utils.ResponseError(c, 400, "当前状态不可开始")
		return
	}
	
	now := time.Now()
	plan.Status = "进行中"
	plan.StartTime = &now
	
	database.DB.Save(&plan)
	utils.ResponseSuccess(c, plan)
}

func CheckInventoryItem(c *gin.Context) {
	var req struct {
		PlanID         uint   `json:"plan_id" binding:"required"`
		CollectionNo   string `json:"collection_no" binding:"required"`
		ActualLocation string `json:"actual_location"`
		IsOffline      int8   `json:"is_offline"`
		Remarks        string `json:"remarks"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ResponseError(c, 400, "参数错误")
		return
	}
	
	var item models.InventoryItem
	if err := database.DB.Where("plan_id = ? AND collection_no = ?", req.PlanID, req.CollectionNo).First(&item).Error; err != nil {
		utils.ResponseError(c, 404, "藏品不在盘点清单中")
		return
	}
	
	checkedBy := utils.GetUserID(c)
	now := time.Now()
	
	item.Status = "已盘点"
	item.ActualLocation = req.ActualLocation
	item.CheckedBy = &checkedBy
	item.CheckedAt = &now
	item.IsOffline = req.IsOffline
	item.Remarks = req.Remarks
	
	database.DB.Save(&item)
	
	var plan models.InventoryPlan
	database.DB.First(&plan, req.PlanID)
	
	var checkedCount int64
	database.DB.Model(&models.InventoryItem{}).Where("plan_id = ? AND status = ?", req.PlanID, "已盘点").Count(&checkedCount)
	plan.CheckedCount = int(checkedCount)
	
	database.DB.Save(&plan)
	
	utils.ResponseSuccess(c, item)
}

func BatchCheckInventory(c *gin.Context) {
	var req struct {
		PlanID   uint     `json:"plan_id" binding:"required"`
		Items    []string `json:"items"`
		IsOffline int8    `json:"is_offline"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ResponseError(c, 400, "参数错误")
		return
	}
	
	checkedBy := utils.GetUserID(c)
	now := time.Now()
	
	tx := database.DB.Begin()
	
	for _, collectionNo := range req.Items {
		var item models.InventoryItem
		if tx.Where("plan_id = ? AND collection_no = ?", req.PlanID, collectionNo).First(&item).Error == nil {
			item.Status = "已盘点"
			item.CheckedBy = &checkedBy
			item.CheckedAt = &now
			item.IsOffline = req.IsOffline
			tx.Save(&item)
		}
	}
	
	var plan models.InventoryPlan
	tx.First(&plan, req.PlanID)
	
	var checkedCount int64
	tx.Model(&models.InventoryItem{}).Where("plan_id = ? AND status = ?", req.PlanID, "已盘点").Count(&checkedCount)
	plan.CheckedCount = int(checkedCount)
	
	tx.Save(&plan)
	tx.Commit()
	
	utils.ResponseSuccess(c, gin.H{"checked_count": len(req.Items)})
}

func CompleteInventory(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var plan models.InventoryPlan
	if err := database.DB.First(&plan, id).Error; err != nil {
		utils.ResponseError(c, 404, "盘点计划不存在")
		return
	}
	
	if plan.Status != "进行中" {
		utils.ResponseError(c, 400, "当前状态不可结束")
		return
	}
	
	tx := database.DB.Begin()
	
	var missingCount int64
	tx.Model(&models.InventoryItem{}).Where("plan_id = ? AND status = ?", id, "待盘点").Count(&missingCount)
	
	tx.Model(&models.InventoryItem{}).Where("plan_id = ? AND status = ?", id, "待盘点").Update("status", "待查")
	
	now := time.Now()
	plan.Status = "已完成"
	plan.EndTime = &now
	plan.MissingCount = int(missingCount)
	
	tx.Save(&plan)
	tx.Commit()
	
	utils.ResponseSuccess(c, plan)
}

func GetInventoryItems(c *gin.Context) {
	planID := c.Query("plan_id")
	status := c.Query("status")
	page, pageSize := utils.GetPagination(c)
	
	var items []models.InventoryItem
	var total int64
	
	query := database.DB.Model(&models.InventoryItem{})
	
	if planID != "" {
		query = query.Where("plan_id = ?", planID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("id DESC").Find(&items)
	
	utils.ResponseSuccess(c, gin.H{
		"list":  items,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}
