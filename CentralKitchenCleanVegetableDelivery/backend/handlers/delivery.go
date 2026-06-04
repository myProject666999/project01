package handlers

import (
	"central-kitchen/database"
	"central-kitchen/models"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetVehicles(c *gin.Context) {
	var vehicles []models.Vehicle
	database.DB.Find(&vehicles)
	c.JSON(http.StatusOK, gin.H{"data": vehicles})
}

func GetDeliveries(c *gin.Context) {
	var deliveries []models.Delivery
	query := database.DB.Preload("Vehicle")

	if date := c.Query("date"); date != "" {
		query = query.Where("delivery_date = ?", date)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	query.Order("created_at desc").Find(&deliveries)
	c.JSON(http.StatusOK, gin.H{"data": deliveries})
}

func GetDelivery(c *gin.Context) {
	var delivery models.Delivery
	if err := database.DB.Preload("Vehicle").First(&delivery, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "配送单不存在"})
		return
	}

	var deliveryItems []models.DeliveryItem
	database.DB.Where("delivery_id = ?", delivery.ID).Preload("Customer").Find(&deliveryItems)

	for i := range deliveryItems {
		var order models.Order
		database.DB.Preload("OrderItems.Product").First(&order, deliveryItems[i].OrderID)
		deliveryItems[i].Order = order
	}

	result := map[string]interface{}{
		"id":                delivery.ID,
		"delivery_no":       delivery.DeliveryNo,
		"vehicle_id":        delivery.VehicleID,
		"delivery_date":     delivery.DeliveryDate,
		"plan_depart_time":  delivery.PlanDepartTime,
		"actual_depart_time": delivery.ActualDepartTime,
		"actual_arrive_time": delivery.ActualArriveTime,
		"status":            delivery.Status,
		"route":             delivery.Route,
		"created_at":        delivery.CreatedAt,
		"updated_at":        delivery.UpdatedAt,
		"vehicle":           delivery.Vehicle,
		"delivery_items":    deliveryItems,
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

type GenerateDeliveriesInput struct {
	DeliveryDate string `json:"delivery_date" binding:"required"`
}

func GenerateDeliveries(c *gin.Context) {
	var input GenerateDeliveriesInput
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
	database.DB.Preload("Customer").Where("DATE(delivery_date) = ? AND status = 2", deliveryDate.Format("2006-01-02")).Find(&orders)

	if len(orders) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "该日期没有已完成加工的订单"})
		return
	}

	var vehicles []models.Vehicle
	database.DB.Where("status = 1").Find(&vehicles)

	if len(vehicles) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "没有可用车辆"})
		return
	}

	customerOrders := make(map[uint][]models.Order)
	for _, order := range orders {
		customerOrders[order.CustomerID] = append(customerOrders[order.CustomerID], order)
	}

	var createdDeliveries []models.Delivery
	tx := database.DB.Begin()

	ordersPerVehicle := (len(customerOrders) + len(vehicles) - 1) / len(vehicles)
	customerIDs := make([]uint, 0, len(customerOrders))
	for id := range customerOrders {
		customerIDs = append(customerIDs, id)
	}

	for vehicleIdx, vehicle := range vehicles {
		deliveryNo := fmt.Sprintf("DEL%sV%d", time.Now().Format("20060102150405"), vehicleIdx+1)

		planDepart := time.Date(deliveryDate.Year(), deliveryDate.Month(), deliveryDate.Day(), 6, 0, 0, 0, time.Local)

		delivery := models.Delivery{
			DeliveryNo:     deliveryNo,
			VehicleID:      vehicle.ID,
			DeliveryDate:   deliveryDate,
			PlanDepartTime: &planDepart,
			Status:         0,
			Route:          fmt.Sprintf("配送路线 %d", vehicleIdx+1),
		}

		if err := tx.Create(&delivery).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "创建配送单失败: " + err.Error()})
			return
		}

		startIdx := vehicleIdx * ordersPerVehicle
		endIdx := startIdx + ordersPerVehicle
		if endIdx > len(customerIDs) {
			endIdx = len(customerIDs)
		}

		sequence := 1
		for i := startIdx; i < endIdx; i++ {
			custID := customerIDs[i]
			for _, order := range customerOrders[custID] {
				deliveryItem := models.DeliveryItem{
					DeliveryID: delivery.ID,
					OrderID:    order.ID,
					CustomerID: custID,
					Sequence:   &sequence,
				}
				if err := tx.Create(&deliveryItem).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "创建配送明细失败: " + err.Error()})
					return
				}

				if err := tx.Model(&models.Order{}).Where("id = ?", order.ID).Update("status", 3).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "更新订单状态失败: " + err.Error()})
					return
				}
			}
			sequence++
		}

		createdDeliveries = append(createdDeliveries, delivery)
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "提交事务失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": createdDeliveries, "message": fmt.Sprintf("成功生成 %d 个配送单", len(createdDeliveries))})
}

func UpdateDeliveryStatus(c *gin.Context) {
	var delivery models.Delivery
	if err := database.DB.First(&delivery, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "配送单不存在"})
		return
	}

	var input struct {
		Status int `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	if input.Status == 1 && delivery.ActualDepartTime == nil {
		delivery.ActualDepartTime = &now
	} else if input.Status == 2 && delivery.ActualArriveTime == nil {
		delivery.ActualArriveTime = &now
	}

	delivery.Status = input.Status
	updates := map[string]interface{}{"status": delivery.Status}
	if delivery.ActualDepartTime != nil {
		updates["actual_depart_time"] = *delivery.ActualDepartTime
	}
	if delivery.ActualArriveTime != nil {
		updates["actual_arrive_time"] = *delivery.ActualArriveTime
	}
	database.DB.Model(&delivery).Updates(updates)
	c.JSON(http.StatusOK, gin.H{"data": delivery})
}

func SignDeliveryItem(c *gin.Context) {
	var item models.DeliveryItem
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "配送明细不存在"})
		return
	}

	var input struct {
		SignPerson           string `json:"sign_person" binding:"required"`
		TemperatureConfirmed int    `json:"temperature_confirmed"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	database.DB.Model(&item).Updates(map[string]interface{}{
		"sign_time":              now,
		"sign_person":            input.SignPerson,
		"temperature_confirmed":  input.TemperatureConfirmed,
	})

	database.DB.Model(&models.Order{}).Where("id = ?", item.OrderID).Update("status", 4)

	c.JSON(http.StatusOK, gin.H{"data": item})
}

func GetTemperatureRecords(c *gin.Context) {
	deliveryID := c.Query("delivery_id")
	var records []models.TemperatureRecord
	query := database.DB
	if deliveryID != "" {
		query = query.Where("delivery_id = ?", deliveryID)
	}
	query.Order("record_time desc").Find(&records)
	c.JSON(http.StatusOK, gin.H{"data": records})
}

func CreateTemperatureRecord(c *gin.Context) {
	var record models.TemperatureRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	record.RecordTime = time.Now()
	database.DB.Create(&record)
	c.JSON(http.StatusOK, gin.H{"data": record})
}
