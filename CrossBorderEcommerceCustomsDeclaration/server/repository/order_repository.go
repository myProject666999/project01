package repository

import (
	"customs-declaration/model"

	"gorm.io/gorm"
)

type OrderRepo struct {
	DB *gorm.DB
}

func (r *OrderRepo) FindAll(page, pageSize int, platform, status, startDate, endDate string) ([]model.Order, int64) {
	var orders []model.Order
	var total int64

	query := r.DB.Model(&model.Order{})

	if platform != "" {
		query = query.Where("platform = ?", platform)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if startDate != "" {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("created_at <= ?", endDate)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&orders)

	return orders, total
}

func (r *OrderRepo) FindByID(id uint) (*model.Order, error) {
	var order model.Order
	if err := r.DB.Preload("OrderItems").First(&order, id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepo) Create(order *model.Order) error {
	return r.DB.Create(order).Error
}

func (r *OrderRepo) Update(order *model.Order) error {
	return r.DB.Save(order).Error
}

func (r *OrderRepo) FindByPlatformOrderID(platform, platformOrderID string) (*model.Order, error) {
	var order model.Order
	if err := r.DB.Where("platform = ? AND platform_order_id = ?", platform, platformOrderID).First(&order).Error; err != nil {
		return nil, err
	}
	return &order, nil
}
