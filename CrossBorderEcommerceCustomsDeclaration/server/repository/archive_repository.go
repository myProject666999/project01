package repository

import (
	"customs-declaration/model"

	"gorm.io/gorm"
)

type ArchiveRepo struct {
	DB *gorm.DB
}

func (r *ArchiveRepo) FindAll(page, pageSize int) ([]model.CustomsArchive, int64) {
	var archives []model.CustomsArchive
	var total int64

	query := r.DB.Model(&model.CustomsArchive{})
	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&archives)

	return archives, total
}

func (r *ArchiveRepo) FindByID(id uint) (*model.CustomsArchive, error) {
	var archive model.CustomsArchive
	if err := r.DB.First(&archive, id).Error; err != nil {
		return nil, err
	}
	return &archive, nil
}

func (r *ArchiveRepo) Create(archive *model.CustomsArchive) error {
	return r.DB.Create(archive).Error
}
