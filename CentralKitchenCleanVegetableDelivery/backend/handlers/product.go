package handlers

import (
	"central-kitchen/database"
	"central-kitchen/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetProducts(c *gin.Context) {
	var products []models.Product
	database.DB.Find(&products)
	c.JSON(http.StatusOK, gin.H{"data": products})
}

func GetProduct(c *gin.Context) {
	var product models.Product
	if err := database.DB.First(&product, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "菜品不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": product})
}

func CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建菜品失败: " + err.Error()})
		return
	}
	database.DB.First(&product, product.ID)
	c.JSON(http.StatusOK, gin.H{"data": product})
}

func UpdateProduct(c *gin.Context) {
	var product models.Product
	if err := database.DB.First(&product, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "菜品不存在"})
		return
	}
	var input models.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.Model(&product).Updates(map[string]interface{}{
		"name":            input.Name,
		"category":        input.Category,
		"unit":            input.Unit,
		"price":           input.Price,
		"processing_time": input.ProcessingTime,
		"equipment_type":  input.EquipmentType,
		"status":          input.Status,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新菜品失败: " + err.Error()})
		return
	}
	database.DB.First(&product, product.ID)
	c.JSON(http.StatusOK, gin.H{"data": product})
}

func DeleteProduct(c *gin.Context) {
	var product models.Product
	if err := database.DB.First(&product, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "菜品不存在"})
		return
	}
	database.DB.Delete(&product)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
