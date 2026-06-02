package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strconv"
	"time"

	"used_car_inspection/config"
	"used_car_inspection/models"
	"used_car_inspection/utils"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func GetReports(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("pageSize", 10)
	status := c.Query("status")
	keyword := c.Query("keyword")

	query := config.DB.Model(&models.InspectionReport{}).Preload("Vehicle").Preload("Inspector")

	if status != "" {
		query = query.Where("inspection_reports.status = ?", status)
	}

	if keyword != "" {
		query = query.Joins("JOIN vehicles ON vehicles.id = inspection_reports.vehicle_id").
			Where("vehicles.vin LIKE ? OR vehicles.brand LIKE ? OR vehicles.model LIKE ? OR report_no LIKE ?",
				"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var reports []models.InspectionReport
	offset := (page - 1) * pageSize
	query.Order("inspection_reports.created_at DESC").Offset(offset).Limit(pageSize).Find(&reports)

	return utils.PageResult(c, reports, total, page, pageSize)
}

func GetReport(c *fiber.Ctx) error {
	id := c.Params("id")
	var report models.InspectionReport
	if err := config.DB.Preload("Vehicle").Preload("Inspector").
		Preload("CategoryScores").
		First(&report, id).Error; err != nil {
		return utils.Error(c, 404, "报告不存在")
	}

	var results []models.InspectionResult
	config.DB.Preload("Item").Preload("Photos").Preload("RepairSuggestion").
		Where("report_id = ?", id).Find(&results)
	report.Results = results

	return utils.Success(c, report)
}

func GetReportByShareToken(c *fiber.Ctx) error {
	token := c.Params("token")
	var report models.InspectionReport
	if err := config.DB.Where("share_token = ?", token).
		Preload("Vehicle").Preload("Inspector").
		Preload("CategoryScores").
		First(&report).Error; err != nil {
		return utils.Error(c, 404, "报告不存在")
	}

	if report.ShareExpireAt != nil && report.ShareExpireAt.Before(time.Now()) {
		return utils.Error(c, 403, "报告分享链接已过期")
	}

	var results []models.InspectionResult
	config.DB.Preload("Item").Preload("Photos").Preload("RepairSuggestion").
		Where("report_id = ?", report.ID).Find(&results)
	report.Results = results

	return utils.Success(c, report)
}

func CreateReport(c *fiber.Ctx) error {
	userId := c.Locals("userId").(uint64)

	var req struct {
		VehicleID      uint64 `json:"vehicleId"`
		InspectionDate string `json:"inspectionDate"`
		Mileage        int    `json:"mileage"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "参数错误")
	}

	reportNo := fmt.Sprintf("RPT%s", time.Now().Format("20060102150405"))

	report := models.InspectionReport{
		ReportNo:       reportNo,
		VehicleID:      req.VehicleID,
		InspectorID:    userId,
		Status:         "draft",
		InspectionDate: req.InspectionDate,
		Mileage:        req.Mileage,
	}

	if err := config.DB.Create(&report).Error; err != nil {
		return utils.Error(c, 500, "创建报告失败")
	}

	return utils.Success(c, report)
}

func SaveInspectionResult(c *fiber.Ctx) error {
	reportIdStr := c.Params("id")
	reportId, _ := strconv.ParseUint(reportIdStr, 10, 64)

	var results []models.InspectionResult
	if err := c.BodyParser(&results); err != nil {
		return utils.Error(c, 400, "参数错误")
	}

	for i := range results {
		results[i].ReportID = reportId
	}

	config.DB.Where("report_id = ?", reportId).Delete(&models.InspectionResult{})

	if err := config.DB.Create(&results).Error; err != nil {
		return utils.Error(c, 500, "保存失败")
	}

	return utils.Success(c, nil)
}

func SubmitReport(c *fiber.Ctx) error {
	reportIdStr := c.Params("id")
	reportId, _ := strconv.ParseUint(reportIdStr, 10, 64)

	var report models.InspectionReport
	if err := config.DB.First(&report, reportId).Error; err != nil {
		return utils.Error(c, 404, "报告不存在")
	}

	var results []models.InspectionResult
	config.DB.Where("report_id = ?", reportId).Find(&results)

	categoryScores := make(map[uint64]fiber.Map)
	totalScore := 0.0
	maxTotalScore := 0.0
	totalWeight := 0.0

	for _, result := range results {
		var item models.InspectionItem
		config.DB.First(&item, result.ItemID)

		if _, ok := categoryScores[result.CategoryID]; !ok {
			var cat models.InspectionCategory
			config.DB.First(&cat, result.CategoryID)
			categoryScores[result.CategoryID] = fiber.Map{
				"categoryId":   result.CategoryID,
				"categoryName": cat.Name,
				"weight":       cat.Weight,
				"score":        0,
				"maxScore":     0,
			}
		}

		cs := categoryScores[result.CategoryID]
		cs["score"] = cs["score"].(int) + result.Score
		cs["maxScore"] = cs["maxScore"].(int) + item.ScoreOk
		categoryScores[result.CategoryID] = cs
	}

	config.DB.Where("report_id = ?", reportId).Delete(&models.CategoryScore{})

	for _, cs := range categoryScores {
		score := float64(cs["score"].(int))
		maxScore := float64(cs["maxScore"].(int))
		weight := cs["weight"].(float64)

		percentage := (score / maxScore) * 100
		totalScore += percentage * weight
		maxTotalScore += 100 * weight
		totalWeight += weight

		var catScore models.CategoryScore
		catScore.ReportID = reportId
		catScore.CategoryID = cs["categoryId"].(uint64)
		catScore.CategoryName = cs["categoryName"].(string)
		catScore.TotalScore = score
		catScore.MaxScore = maxScore
		catScore.Percentage = percentage
		config.DB.Create(&catScore)
	}

	weightedScore := totalScore / maxTotalScore * 100
	report.TotalScore = weightedScore

	if weightedScore >= 90 {
		report.Level = "A"
	} else if weightedScore >= 80 {
		report.Level = "B"
	} else if weightedScore >= 70 {
		report.Level = "C"
	} else {
		report.Level = "D"
	}

	report.Status = "submitted"
	config.DB.Save(&report)

	config.DB.Where("report_id = ?", reportId).Delete(&models.RepairSuggestion{})

	for _, result := range results {
		if result.Result != "ok" {
			var item models.InspectionItem
			config.DB.First(&item, result.ItemID)

			var suggestion models.RepairSuggestion
			suggestion.ResultID = result.ID
			suggestion.ReportID = reportId
			suggestion.ItemName = item.Name

			if result.Result == "abnormal" {
				suggestion.ProblemDescription = item.Name + "存在异常，需要维修"
				suggestion.Suggestion = "建议立即到专业维修店检修"
				suggestion.EstimatedCost = 500.00
				suggestion.Urgency = "high"
			} else {
				suggestion.ProblemDescription = item.Name + "存在轻微问题，需要关注"
				suggestion.Suggestion = "建议下次保养时检查"
				suggestion.EstimatedCost = 100.00
				suggestion.Urgency = "medium"
			}

			config.DB.Create(&suggestion)
		}
	}

	return utils.Success(c, report)
}

func GenerateShareLink(c *fiber.Ctx) error {
	reportIdStr := c.Params("id")
	reportId, _ := strconv.ParseUint(reportIdStr, 10, 64)

	var report models.InspectionReport
	if err := config.DB.First(&report, reportId).Error; err != nil {
		return utils.Error(c, 404, "报告不存在")
	}

	tokenBytes := make([]byte, 16)
	rand.Read(tokenBytes)
	shareToken := hex.EncodeToString(tokenBytes)

	expireAt := time.Now().AddDate(0, 0, 30)
	report.ShareToken = shareToken
	report.ShareExpireAt = &expireAt
	config.DB.Save(&report)

	shareUrl := fmt.Sprintf("/share/%s", shareToken)

	return utils.Success(c, fiber.Map{
		"shareUrl":   shareUrl,
		"shareToken": shareToken,
		"expireAt":   expireAt,
		"expireDays": 30,
	})
}

func DeleteReport(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Transaction(func(tx *gorm.DB) error {
		tx.Where("report_id = ?", id).Delete(&models.CategoryScore{})
		tx.Where("report_id = ?", id).Delete(&models.RepairSuggestion{})
		tx.Where("report_id = ?", id).Delete(&models.InspectionPhoto{})
		tx.Where("report_id = ?", id).Delete(&models.InspectionResult{})
		if err := tx.Delete(&models.InspectionReport{}, id).Error; err != nil {
			return err
		}
		return nil
	}); err != nil {
		return utils.Error(c, 500, "删除失败")
	}
	return utils.Success(c, nil)
}
