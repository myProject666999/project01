package repository

import (
	"customs-declaration/model"

	"gorm.io/gorm"
)

type HSCodeRepo struct {
	DB *gorm.DB
}

func (r *HSCodeRepo) FindAll(page, pageSize int, category, keyword string) ([]model.HSCode, int64) {
	var codes []model.HSCode
	var total int64

	query := r.DB.Model(&model.HSCode{})

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if keyword != "" {
		query = query.Where("code LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("code ASC").Find(&codes)

	return codes, total
}

func (r *HSCodeRepo) FindByCode(code string) (*model.HSCode, error) {
	var hsCode model.HSCode
	if err := r.DB.Where("code = ?", code).First(&hsCode).Error; err != nil {
		return nil, err
	}
	return &hsCode, nil
}

func (r *HSCodeRepo) Create(hsCode *model.HSCode) error {
	return r.DB.Create(hsCode).Error
}

func (r *HSCodeRepo) Update(hsCode *model.HSCode) error {
	return r.DB.Save(hsCode).Error
}

func (r *HSCodeRepo) FindMappingByCategory(category string) ([]model.CategoryMapping, error) {
	var mappings []model.CategoryMapping
	if err := r.DB.Where("category = ?", category).Find(&mappings).Error; err != nil {
		return nil, err
	}
	return mappings, nil
}

func (r *HSCodeRepo) FindAllMappings(page, pageSize int) ([]model.CategoryMapping, int64) {
	var mappings []model.CategoryMapping
	var total int64

	query := r.DB.Model(&model.CategoryMapping{})
	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("category ASC").Find(&mappings)

	return mappings, total
}

func (r *HSCodeRepo) CreateMapping(mapping *model.CategoryMapping) error {
	return r.DB.Create(mapping).Error
}

func (r *HSCodeRepo) UpdateMapping(mapping *model.CategoryMapping) error {
	return r.DB.Save(mapping).Error
}

func (r *HSCodeRepo) DeleteMapping(id uint) error {
	return r.DB.Delete(&model.CategoryMapping{}, id).Error
}

func (r *HSCodeRepo) FindUnmatchedItems(page, pageSize int) ([]model.OrderItem, int64) {
	var items []model.OrderItem
	var total int64

	query := r.DB.Model(&model.OrderItem{}).Where("hs_matched = ?", false)
	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&items)

	return items, total
}
