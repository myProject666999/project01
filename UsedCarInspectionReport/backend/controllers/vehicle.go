package controllers

import (
	"used_car_inspection/config"
	"used_car_inspection/models"
	"used_car_inspection/utils"

	"github.com/gofiber/fiber/v2"
)

func GetVehicles(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("pageSize", 10)
	keyword := c.Query("keyword")

	query := config.DB.Model(&models.Vehicle{})
	if keyword != "" {
		query = query.Where("vin LIKE ? OR brand LIKE ? OR model LIKE ? OR license_plate LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var vehicles []models.Vehicle
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&vehicles)

	return utils.PageResult(c, vehicles, total, page, pageSize)
}

func GetVehicle(c *fiber.Ctx) error {
	id := c.Params("id")
	var vehicle models.Vehicle
	if err := config.DB.First(&vehicle, id).Error; err != nil {
		return utils.Error(c, 404, "车辆不存在")
	}
	return utils.Success(c, vehicle)
}

func CreateVehicle(c *fiber.Ctx) error {
	var vehicle models.Vehicle
	if err := c.BodyParser(&vehicle); err != nil {
		return utils.Error(c, 400, "参数错误")
	}

	var count int64
	config.DB.Model(&models.Vehicle{}).Where("vin = ?", vehicle.Vin).Count(&count)
	if count > 0 {
		return utils.Error(c, 400, "该车架号已存在")
	}

	if err := config.DB.Create(&vehicle).Error; err != nil {
		return utils.Error(c, 500, "创建失败")
	}

	return utils.Success(c, vehicle)
}

func UpdateVehicle(c *fiber.Ctx) error {
	id := c.Params("id")
	var vehicle models.Vehicle
	if err := config.DB.First(&vehicle, id).Error; err != nil {
		return utils.Error(c, 404, "车辆不存在")
	}

	if err := c.BodyParser(&vehicle); err != nil {
		return utils.Error(c, 400, "参数错误")
	}

	config.DB.Save(&vehicle)
	return utils.Success(c, vehicle)
}

func DeleteVehicle(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Vehicle{}, id).Error; err != nil {
		return utils.Error(c, 500, "删除失败")
	}
	return utils.Success(c, nil)
}
