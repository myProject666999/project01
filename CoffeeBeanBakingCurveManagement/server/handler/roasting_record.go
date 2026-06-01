package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"coffee-baking/server/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RoastingRecordHandler struct {
	DB *gorm.DB
}

func (h *RoastingRecordHandler) List(c *gin.Context) {
	var records []model.RoastingRecord
	query := h.DB.Order("roasting_date DESC")
	if greenBeanID := c.Query("green_bean_id"); greenBeanID != "" {
		query = query.Where("green_bean_id = ?", greenBeanID)
	}
	if err := query.Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, records)
}

func (h *RoastingRecordHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var record model.RoastingRecord
	if err := h.DB.Preload("GreenBean").Preload("CurvePoints").Preload("CuppingScore").First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, record)
}

type createRoastingRecordRequest struct {
	model.RoastingRecord
	CurvePoints []model.CurvePoint `json:"curve_points"`
}

func (h *RoastingRecordHandler) Create(c *gin.Context) {
	var req createRoastingRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&req.RoastingRecord).Error; err != nil {
			return err
		}
		for i := range req.CurvePoints {
			req.CurvePoints[i].RoastingRecordID = req.RoastingRecord.ID
		}
		if len(req.CurvePoints) > 0 {
			if err := tx.Create(&req.CurvePoints).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.DB.Preload("GreenBean").Preload("CurvePoints").Preload("CuppingScore").First(&req.RoastingRecord, req.RoastingRecord.ID)
	c.JSON(http.StatusCreated, req.RoastingRecord)
}

func (h *RoastingRecordHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var req createRoastingRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		var existing model.RoastingRecord
		if err := tx.First(&existing, id).Error; err != nil {
			return err
		}
		req.RoastingRecord.ID = id
		if err := tx.Save(&req.RoastingRecord).Error; err != nil {
			return err
		}
		tx.Where("roasting_record_id = ?", id).Delete(&model.CurvePoint{})
		for i := range req.CurvePoints {
			req.CurvePoints[i].ID = 0
			req.CurvePoints[i].RoastingRecordID = id
		}
		if len(req.CurvePoints) > 0 {
			if err := tx.Create(&req.CurvePoints).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var result model.RoastingRecord
	h.DB.Preload("GreenBean").Preload("CurvePoints").Preload("CuppingScore").First(&result, id)
	c.JSON(http.StatusOK, result)
}

func (h *RoastingRecordHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		tx.Where("roasting_record_id = ?", id).Delete(&model.CurvePoint{})
		tx.Where("roasting_record_id = ?", id).Delete(&model.CuppingScore{})
		if err := tx.Delete(&model.RoastingRecord{}, id).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *RoastingRecordHandler) Compare(c *gin.Context) {
	ids := c.QueryArray("ids")
	if len(ids) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "at least 2 ids required"})
		return
	}

	var records []model.RoastingRecord
	if err := h.DB.Preload("CurvePoints").Preload("GreenBean").Preload("CuppingScore").
		Where("id IN ?", ids).Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, records)
}

type artisanJSON struct {
	Title   string `json:"title"`
	Special struct {
		TurningYellowIndex *int `json:"turning_yellow_index"`
		FirstCrackIndex    *int `json:"first_crack_index"`
	} `json:"special"`
	BeanTemperature  []interface{} `json:"beans"`
	AirTemperature   []interface{} `json:"air"`
	Timestamps       []interface{} `json:"timeindex"`
}

func parseArtisanFloat(v interface{}) (float64, error) {
	switch val := v.(type) {
	case float64:
		return val, nil
	case json.Number:
		return val.Float64()
	case string:
		f, err := strconv.ParseFloat(val, 64)
		if err != nil {
			return 0, err
		}
		return f, nil
	default:
		return 0, fmt.Errorf("cannot parse %v as float", v)
	}
}

func (h *RoastingRecordHandler) ImportArtisan(c *gin.Context) {
	var artisan artisanJSON
	if err := c.ShouldBindJSON(&artisan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var beanPoints []model.CurvePoint
	var airPoints []model.CurvePoint

	for i, tsRaw := range artisan.Timestamps {
		ts, err := parseArtisanFloat(tsRaw)
		if err != nil {
			continue
		}
		if i < len(artisan.BeanTemperature) {
			bt, err := parseArtisanFloat(artisan.BeanTemperature[i])
			if err == nil {
				beanPoints = append(beanPoints, model.CurvePoint{
					CurveType:      "bean_temp",
					ElapsedSeconds: ts,
					Temperature:    bt,
				})
			}
		}
		if i < len(artisan.AirTemperature) {
			at, err := parseArtisanFloat(artisan.AirTemperature[i])
			if err == nil {
				airPoints = append(airPoints, model.CurvePoint{
					CurveType:      "air_temp",
					ElapsedSeconds: ts,
					Temperature:    at,
				})
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"title":        artisan.Title,
		"bean_points":  beanPoints,
		"air_points":   airPoints,
		"turning_yellow_index": artisan.Special.TurningYellowIndex,
		"first_crack_index":    artisan.Special.FirstCrackIndex,
	})
}
