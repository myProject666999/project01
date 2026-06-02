package controllers

import (
	"fmt"
	"path/filepath"
	"strconv"
	"time"

	"used_car_inspection/config"
	"used_car_inspection/models"
	"used_car_inspection/utils"

	"github.com/gofiber/fiber/v2"
)

func UploadPhoto(c *fiber.Ctx) error {
	reportId, _ := strconv.ParseUint(c.FormValue("reportId"), 10, 64)
	itemId, _ := strconv.ParseUint(c.FormValue("itemId"), 10, 64)
	resultId, _ := strconv.ParseUint(c.FormValue("resultId"), 10, 64)
	vin := c.FormValue("vin")

	file, err := c.FormFile("file")
	if err != nil {
		return utils.Error(c, 400, "请选择文件")
	}

	if file.Size > 10*1024*1024 {
		return utils.Error(c, 400, "文件大小不能超过10MB")
	}

	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return utils.Error(c, 400, "只支持JPG和PNG格式")
	}

	filename := fmt.Sprintf("%d_%d_%d%s", reportId, itemId, time.Now().Unix(), ext)
	filepath := fmt.Sprintf("%s/%s", config.AppConfig.UploadDir, filename)

	if err := c.SaveFile(file, filepath); err != nil {
		return utils.Error(c, 500, "文件保存失败")
	}

	if vin != "" {
		utils.AddWatermark(filepath, vin)
	}

	photo := models.InspectionPhoto{
		ResultID: resultId,
		ReportID: reportId,
		ItemID:   itemId,
		FilePath: "/uploads/" + filename,
		FileName: file.Filename,
		FileSize: file.Size,
	}

	config.DB.Create(&photo)

	return utils.Success(c, photo)
}

func DeletePhoto(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.InspectionPhoto{}, id).Error; err != nil {
		return utils.Error(c, 500, "删除失败")
	}
	return utils.Success(c, nil)
}
