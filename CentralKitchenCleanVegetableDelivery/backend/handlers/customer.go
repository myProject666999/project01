package handlers

import (
	"central-kitchen/database"
	"central-kitchen/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCustomers(c *gin.Context) {
	var customers []models.Customer
	database.DB.Find(&customers)
	c.JSON(http.StatusOK, gin.H{"data": customers})
}

func GetCustomer(c *gin.Context) {
	var customer models.Customer
	if err := database.DB.First(&customer, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "客户不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": customer})
}

func CreateCustomer(c *gin.Context) {
	var customer models.Customer
	if err := c.ShouldBindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.Create(&customer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建客户失败: " + err.Error()})
		return
	}
	database.DB.First(&customer, customer.ID)
	c.JSON(http.StatusOK, gin.H{"data": customer})
}

func UpdateCustomer(c *gin.Context) {
	var customer models.Customer
	if err := database.DB.First(&customer, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "客户不存在"})
		return
	}
	var input models.Customer
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.Model(&customer).Updates(map[string]interface{}{
		"name":           input.Name,
		"type":           input.Type,
		"address":        input.Address,
		"longitude":      input.Longitude,
		"latitude":       input.Latitude,
		"contact_person": input.ContactPerson,
		"phone":          input.Phone,
		"status":         input.Status,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新客户失败: " + err.Error()})
		return
	}
	database.DB.First(&customer, customer.ID)
	c.JSON(http.StatusOK, gin.H{"data": customer})
}

func DeleteCustomer(c *gin.Context) {
	var customer models.Customer
	if err := database.DB.First(&customer, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "客户不存在"})
		return
	}
	database.DB.Delete(&customer)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
