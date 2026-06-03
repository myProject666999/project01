package controller

import (
	"net/http"
	"strconv"

	"customs-declaration/service"

	"github.com/gin-gonic/gin"
)

type ArchiveController struct {
	Service *service.ArchiveService
}

func (ctrl *ArchiveController) ListArchives(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	archives, total, err := ctrl.Service.ListArchives(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"list":     archives,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		},
	})
}

func (ctrl *ArchiveController) GetArchive(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "message": "invalid id"})
		return
	}

	archive, err := ctrl.Service.GetArchive(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 1, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    archive,
	})
}
