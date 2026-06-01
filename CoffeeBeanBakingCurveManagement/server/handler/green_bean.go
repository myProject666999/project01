package handler

import (
	"net/http"
	"strconv"

	"coffee-baking/server/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type GreenBeanHandler struct {
	DB *gorm.DB
}

func (h *GreenBeanHandler) List(c *gin.Context) {
	var beans []model.GreenBean
	if err := h.DB.Order("created_at DESC").Find(&beans).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, beans)
}

func (h *GreenBeanHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var bean model.GreenBean
	if err := h.DB.First(&bean, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, bean)
}

func (h *GreenBeanHandler) Create(c *gin.Context) {
	var bean model.GreenBean
	if err := c.ShouldBindJSON(&bean); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.DB.Create(&bean).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, bean)
}

func (h *GreenBeanHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var bean model.GreenBean
	if err := h.DB.First(&bean, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if err := c.ShouldBindJSON(&bean); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.DB.Save(&bean).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, bean)
}

func (h *GreenBeanHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.DB.Delete(&model.GreenBean{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
