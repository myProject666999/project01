package handlers

import (
	"central-kitchen/database"
	"central-kitchen/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetWasteRecords(c *gin.Context) {
	var records []models.WasteRecord
	query := database.DB.Preload("Product")

	if date := c.Query("date"); date != "" {
		query = query.Where("record_date = ?", date)
	}

	query.Order("created_at desc").Find(&records)
	c.JSON(http.StatusOK, gin.H{"data": records})
}

func CreateWasteRecord(c *gin.Context) {
	var record models.WasteRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if record.RecordDate.IsZero() {
		record.RecordDate = time.Now()
	}

	database.DB.Create(&record)
	c.JSON(http.StatusOK, gin.H{"data": record})
}

func GetEquipment(c *gin.Context) {
	var equipment []models.Equipment
	database.DB.Find(&equipment)
	c.JSON(http.StatusOK, gin.H{"data": equipment})
}

func CreateEquipment(c *gin.Context) {
	var equipment models.Equipment
	if err := c.ShouldBindJSON(&equipment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&equipment)
	c.JSON(http.StatusOK, gin.H{"data": equipment})
}
