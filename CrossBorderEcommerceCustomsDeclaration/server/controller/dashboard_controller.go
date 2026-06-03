package controller

import (
	"net/http"
	"strconv"

	"customs-declaration/service"

	"github.com/gin-gonic/gin"
)

type DashboardController struct {
	Service *service.DashboardService
}

func (ctrl *DashboardController) GetStats(c *gin.Context) {
	stats, err := ctrl.Service.GetStats()
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

func (ctrl *DashboardController) GetPendingTasks(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit < 1 {
		limit = 10
	}

	tasks, err := ctrl.Service.GetPendingTasks(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    tasks,
	})
}

func (ctrl *DashboardController) GetTrend(c *gin.Context) {
	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))
	if days < 1 {
		days = 30
	}

	trend, err := ctrl.Service.GetTrend(days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    trend,
	})
}
