package handlers

import (
	"central-kitchen/database"
	"central-kitchen/models"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetProcessingTasks(c *gin.Context) {
	var tasks []models.ProcessingTask
	query := database.DB.Preload("Product").Preload("Equipment")

	if date := c.Query("date"); date != "" {
		query = query.Where("DATE(created_at) = ?", date)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	query.Order("created_at desc").Find(&tasks)
	c.JSON(http.StatusOK, gin.H{"data": tasks})
}

type GenerateTasksInput struct {
	DeliveryDate string `json:"delivery_date" binding:"required"`
}

func GenerateProcessingTasks(c *gin.Context) {
	var input GenerateTasksInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deliveryDate, err := time.Parse("2006-01-02", input.DeliveryDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "日期格式错误，请使用 YYYY-MM-DD 格式"})
		return
	}

	var orders []models.Order
	database.DB.Preload("OrderItems").Where("DATE(delivery_date) = ? AND status >= 1", deliveryDate.Format("2006-01-02")).Find(&orders)

	if len(orders) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "该日期没有已确认的订单"})
		return
	}

	productQuantities := make(map[uint]float64)
	for _, order := range orders {
		for _, item := range order.OrderItems {
			productQuantities[item.ProductID] += item.Quantity
		}
	}

	var createdTasks []models.ProcessingTask
	tx := database.DB.Begin()

	for productID, totalQty := range productQuantities {
		var product models.Product
		if err := tx.First(&product, productID).Error; err != nil {
			continue
		}

		taskNo := fmt.Sprintf("TASK%s%04d", time.Now().Format("20060102150405"), uint(time.Now().UnixNano())%10000)

		task := models.ProcessingTask{
			TaskNo:        taskNo,
			ProductID:     productID,
			TotalQuantity: totalQty,
			Status:        0,
		}

		var equipment models.Equipment
		if err := tx.Where("type = ? AND status = 1", product.EquipmentType).First(&equipment).Error; err == nil {
			task.EquipmentID = &equipment.ID
			planStart := time.Now()
			planEnd := planStart.Add(time.Duration(product.ProcessingTime) * time.Minute)
			task.PlanStartTime = &planStart
			task.PlanEndTime = &planEnd
		}

		if err := tx.Create(&task).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "创建加工任务失败: " + err.Error()})
			return
		}

		createdTasks = append(createdTasks, task)
	}

	for _, order := range orders {
		if err := tx.Model(&models.Order{}).Where("id = ?", order.ID).Update("status", 2).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "更新订单状态失败: " + err.Error()})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "提交事务失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": createdTasks, "message": fmt.Sprintf("成功生成 %d 个加工任务", len(createdTasks))})
}

func UpdateProcessingTaskStatus(c *gin.Context) {
	var task models.ProcessingTask
	if err := database.DB.First(&task, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}

	var input struct {
		Status int    `json:"status" binding:"required"`
		Worker string `json:"worker"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	if input.Status == 1 && task.ActualStartTime == nil {
		task.ActualStartTime = &now
	} else if input.Status == 2 && task.ActualEndTime == nil {
		task.ActualEndTime = &now
	}

	task.Status = input.Status
	if input.Worker != "" {
		task.Worker = input.Worker
	}

	updates := map[string]interface{}{"status": task.Status}
	if task.ActualStartTime != nil {
		updates["actual_start_time"] = *task.ActualStartTime
	}
	if task.ActualEndTime != nil {
		updates["actual_end_time"] = *task.ActualEndTime
	}
	if task.Worker != "" {
		updates["worker"] = task.Worker
	}
	database.DB.Model(&task).Updates(updates)
	c.JSON(http.StatusOK, gin.H{"data": task})
}
