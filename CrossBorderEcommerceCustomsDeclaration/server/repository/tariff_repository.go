package repository

import (
	"customs-declaration/model"

	"gorm.io/gorm"
)

type TariffRepo struct {
	DB *gorm.DB
}

func (r *TariffRepo) FindAll(page, pageSize int, paymentStatus, startDate, endDate string) ([]model.TariffRecord, int64) {
	var records []model.TariffRecord
	var total int64

	query := r.DB.Model(&model.TariffRecord{})

	if paymentStatus != "" {
		query = query.Where("payment_status = ?", paymentStatus)
	}
	if startDate != "" {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("created_at <= ?", endDate)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&records)

	return records, total
}

func (r *TariffRepo) FindByID(id uint) (*model.TariffRecord, error) {
	var record model.TariffRecord
	if err := r.DB.Preload("TariffItems").First(&record, id).Error; err != nil {
		return nil, err
	}
	return &record, nil
}

func (r *TariffRepo) Create(record *model.TariffRecord) error {
	return r.DB.Create(record).Error
}

func (r *TariffRepo) Update(record *model.TariffRecord) error {
	return r.DB.Save(record).Error
}
