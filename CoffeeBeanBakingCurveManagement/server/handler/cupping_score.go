package handler

import (
	"net/http"
	"strconv"

	"coffee-baking/server/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CuppingScoreHandler struct {
	DB *gorm.DB
}

func (h *CuppingScoreHandler) List(c *gin.Context) {
	var scores []model.CuppingScore
	query := h.DB.Order("cupping_date DESC")
	if recordID := c.Query("roasting_record_id"); recordID != "" {
		query = query.Where("roasting_record_id = ?", recordID)
	}
	if err := query.Find(&scores).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, scores)
}

func (h *CuppingScoreHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var score model.CuppingScore
	if err := h.DB.First(&score, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, score)
}

func (h *CuppingScoreHandler) Create(c *gin.Context) {
	var score model.CuppingScore
	if err := c.ShouldBindJSON(&score); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	score.TotalScore = score.DryAroma + score.WetAroma + score.Flavor + score.Aftertaste +
		score.Acidity + score.Body + score.Uniformity + score.Balance +
		score.Cleanness + score.Sweetness + score.Overall
	if err := h.DB.Create(&score).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, score)
}

func (h *CuppingScoreHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var score model.CuppingScore
	if err := h.DB.First(&score, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if err := c.ShouldBindJSON(&score); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	score.TotalScore = score.DryAroma + score.WetAroma + score.Flavor + score.Aftertaste +
		score.Acidity + score.Body + score.Uniformity + score.Balance +
		score.Cleanness + score.Sweetness + score.Overall
	if err := h.DB.Save(&score).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, score)
}

func (h *CuppingScoreHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.DB.Delete(&model.CuppingScore{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
