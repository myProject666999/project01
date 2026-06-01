package handlers

import (
	"central-kitchen/database"
	"central-kitchen/models"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetOrders(c *gin.Context) {
	var orders []models.Order
	query := database.DB.Preload("Customer").Preload("OrderItems.Product")

	if deliveryDate := c.Query("delivery_date"); deliveryDate != "" {
		query = query.Where("delivery_date = ?", deliveryDate)
	}
	if customerID := c.Query("customer_id"); customerID != "" {
		query = query.Where("customer_id = ?", customerID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	query.Order("created_at desc").Find(&orders)
	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func GetOrder(c *gin.Context) {
	var order models.Order
	if err := database.DB.Preload("Customer").Preload("OrderItems.Product").First(&order, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "订单不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": order})
}

type OrderItemInput struct {
	ProductID uint    `json:"product_id" binding:"required"`
	Quantity  float64 `json:"quantity" binding:"required"`
}

type CreateOrderInput struct {
	CustomerID   uint             `json:"customer_id" binding:"required"`
	DeliveryDate string           `json:"delivery_date" binding:"required"`
	Remark       string           `json:"remark"`
	Items        []OrderItemInput `json:"items" binding:"required"`
}

func CreateOrder(c *gin.Context) {
	var input CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deliveryDate, err := time.Parse("2006-01-02", input.DeliveryDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "日期格式错误"})
		return
	}

	orderNo := fmt.Sprintf("ORD%s%04d", time.Now().Format("20060102150405"), time.Now().Unix()%10000)

	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range input.Items {
		var product models.Product
		if err := database.DB.First(&product, item.ProductID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("菜品ID %d 不存在", item.ProductID)})
			return
		}

		subtotal := product.Price * item.Quantity
		totalAmount += subtotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			UnitPrice: product.Price,
			Subtotal:  subtotal,
		})
	}

	order := models.Order{
		OrderNo:      orderNo,
		CustomerID:   input.CustomerID,
		DeliveryDate: deliveryDate,
		TotalAmount:  totalAmount,
		Status:       0,
		Remark:       input.Remark,
	}

	tx := database.DB.Begin()
	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for i := range orderItems {
		orderItems[i].OrderID = order.ID
	}

	if err := tx.Create(&orderItems).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	tx.Commit()

	database.DB.Preload("Customer").Preload("OrderItems.Product").First(&order, order.ID)
	c.JSON(http.StatusOK, gin.H{"data": order})
}

func UpdateOrderStatus(c *gin.Context) {
	var order models.Order
	if err := database.DB.First(&order, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "订单不存在"})
		return
	}

	var input struct {
		Status int `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order.Status = input.Status
	database.DB.Save(&order)
	c.JSON(http.StatusOK, gin.H{"data": order})
}
