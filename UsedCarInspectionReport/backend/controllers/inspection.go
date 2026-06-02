package controllers

import (
	"used_car_inspection/config"
	"used_car_inspection/models"
	"used_car_inspection/utils"

	"github.com/gofiber/fiber/v2"
)

func GetCategories(c *fiber.Ctx) error {
	var categories []models.InspectionCategory
	config.DB.Where("status = 1").Order("sort_order ASC").Find(&categories)
	return utils.Success(c, categories)
}

func GetItems(c *fiber.Ctx) error {
	categoryId := c.Query("categoryId")
	var items []models.InspectionItem
	query := config.DB.Where("status = 1")
	if categoryId != "" {
		query = query.Where("category_id = ?", categoryId)
	}
	query.Order("sort_order ASC").Find(&items)
	return utils.Success(c, items)
}

func GetItemsWithCategories(c *fiber.Ctx) error {
	var categories []models.InspectionCategory
	config.DB.Where("status = 1").Order("sort_order ASC").Find(&categories)

	result := make([]fiber.Map, len(categories))
	for i, cat := range categories {
		var items []models.InspectionItem
		config.DB.Where("category_id = ? AND status = 1", cat.ID).Order("sort_order ASC").Find(&items)
		result[i] = fiber.Map{
			"category": cat,
			"items":    items,
		}
	}

	return utils.Success(c, result)
}
