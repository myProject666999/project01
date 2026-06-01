package repository

import (
	"server/model"

	"gorm.io/gorm"
)

type CourseRepository struct {
	db *gorm.DB
}

func NewCourseRepository(db *gorm.DB) *CourseRepository {
	return &CourseRepository{db: db}
}

func (r *CourseRepository) List(category string, offset, limit int) ([]model.Course, int64, error) {
	var courses []model.Course
	var total int64
	query := r.db.Model(&model.Course{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.Offset(offset).Limit(limit).Find(&courses).Error; err != nil {
		return nil, 0, err
	}
	return courses, total, nil
}

func (r *CourseRepository) FindByID(id uint) (*model.Course, error) {
	var course model.Course
	err := r.db.First(&course, id).Error
	if err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *CourseRepository) FindAll() ([]model.Course, error) {
	var courses []model.Course
	err := r.db.Find(&courses).Error
	return courses, err
}

func (r *CourseRepository) IncrementEnrolled(id uint) error {
	return r.db.Model(&model.Course{}).Where("id = ?", id).
		UpdateColumn("enrolled_count", gorm.Expr("enrolled_count + 1")).Error
}

func (r *CourseRepository) DecrementEnrolled(id uint) error {
	return r.db.Model(&model.Course{}).Where("id = ? AND enrolled_count > 0", id).
		UpdateColumn("enrolled_count", gorm.Expr("enrolled_count - 1")).Error
}
