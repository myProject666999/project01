package controller

import (
	"net/http"
	"strconv"

	"customs-declaration/service"

	"github.com/gin-gonic/gin"
)

type TariffController struct {
	Service *service.TariffService
}

func (ctrl *TariffController) ListTariffs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	paymentStatus := c.Query("paymentStatus")
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	records, total, err := ctrl.Service.ListTariffs(page, pageSize, paymentStatus, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"list":     records,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		},
	})
}

func (ctrl *TariffController) GetTariff(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "invalid id"})
		return
	}

	record, err := ctrl.Service.GetTariff(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    record,
	})
}

func (ctrl *TariffController) PayTariff(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "invalid id"})
		return
	}

	if err := ctrl.Service.PayTariff(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
	})
}

func (ctrl *TariffController) GetStatistics(c *gin.Context) {
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	stats, err := ctrl.Service.GetStatistics(startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    stats,
	})
}
