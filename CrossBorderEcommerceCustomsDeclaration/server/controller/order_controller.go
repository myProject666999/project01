package controller

import (
	"net/http"
	"strconv"

	"customs-declaration/service"

	"github.com/gin-gonic/gin"
)

type OrderController struct {
	Service *service.OrderService
}

func (ctrl *OrderController) ListOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	platform := c.Query("platform")
	status := c.Query("status")
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	orders, total, err := ctrl.Service.ListOrders(page, pageSize, platform, status, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"list":     orders,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		},
	})
}

func (ctrl *OrderController) GetOrder(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "invalid id"})
		return
	}

	order, err := ctrl.Service.GetOrder(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    order,
	})
}

func (ctrl *OrderController) SyncOrders(c *gin.Context) {
	platform := c.Query("platform")
	if platform == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "platform is required"})
		return
	}

	if err := ctrl.Service.SyncOrders(platform); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
	})
}
