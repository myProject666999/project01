package repository

import (
	"customs-declaration/model"

	"gorm.io/gorm"
)

type DeclarationRepo struct {
	DB *gorm.DB
}

func (r *DeclarationRepo) FindAll(page, pageSize int, status, startDate, endDate string) ([]model.Declaration, int64) {
	var declarations []model.Declaration
	var total int64

	query := r.DB.Model(&model.Declaration{})

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
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&declarations)

	return declarations, total
}

func (r *DeclarationRepo) FindByID(id uint) (*model.Declaration, error) {
	var declaration model.Declaration
	if err := r.DB.Preload("DeclarationItems").Preload("DeclarationOrders").Preload("DeclarationOrders.Order").First(&declaration, id).Error; err != nil {
		return nil, err
	}
	return &declaration, nil
}

func (r *DeclarationRepo) Create(declaration *model.Declaration) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Omit("DeclarationItems", "DeclarationOrders").Create(declaration).Error; err != nil {
			return err
		}

		for i := range declaration.DeclarationItems {
			declaration.DeclarationItems[i].DeclarationID = declaration.ID
		}
		if len(declaration.DeclarationItems) > 0 {
			if err := tx.Create(&declaration.DeclarationItems).Error; err != nil {
				return err
			}
		}

		for i := range declaration.DeclarationOrders {
			declaration.DeclarationOrders[i].DeclarationID = declaration.ID
		}
		if len(declaration.DeclarationOrders) > 0 {
			if err := tx.Create(&declaration.DeclarationOrders).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *DeclarationRepo) Update(declaration *model.Declaration) error {
	return r.DB.Save(declaration).Error
}

func (r *DeclarationRepo) UpdateItem(item *model.DeclarationItem) error {
	return r.DB.Save(item).Error
}
