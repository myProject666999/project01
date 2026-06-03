package repository

import (
	"server/model"

	"gorm.io/gorm"
)

type EnrollmentRepository struct {
	db *gorm.DB
}

func NewEnrollmentRepository(db *gorm.DB) *EnrollmentRepository {
	return &EnrollmentRepository{db: db}
}

func (r *EnrollmentRepository) Create(enrollment *model.Enrollment) error {
	return r.db.Create(enrollment).Error
}

func (r *EnrollmentRepository) FindByID(id uint) (*model.Enrollment, error) {
	var enrollment model.Enrollment
	err := r.db.First(&enrollment, id).Error
	if err != nil {
		return nil, err
	}
	return &enrollment, nil
}

func (r *EnrollmentRepository) FindByUserAndCourse(userID, courseID uint) (*model.Enrollment, error) {
	var enrollment model.Enrollment
	err := r.db.Where("user_id = ? AND course_id = ? AND status = ?", userID, courseID, 1).First(&enrollment).Error
	if err != nil {
		return nil, err
	}
	return &enrollment, nil
}

func (r *EnrollmentRepository) FindAnyByUserAndCourse(userID, courseID uint) (*model.Enrollment, error) {
	var enrollment model.Enrollment
	err := r.db.Where("user_id = ? AND course_id = ?", userID, courseID).First(&enrollment).Error
	if err != nil {
		return nil, err
	}
	return &enrollment, nil
}

func (r *EnrollmentRepository) ListByUserID(userID uint) ([]model.Enrollment, error) {
	var enrollments []model.Enrollment
	err := r.db.Where("user_id = ? AND status = ?", userID, 1).
		Preload("Course").Find(&enrollments).Error
	return enrollments, err
}

func (r *EnrollmentRepository) CountByUserID(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.Enrollment{}).Where("user_id = ? AND status = ?", userID, 1).Count(&count).Error
	return count, err
}

func (r *EnrollmentRepository) UpdateStatus(id uint, status int) error {
	return r.db.Model(&model.Enrollment{}).Where("id = ?", id).Update("status", status).Error
}

func (r *EnrollmentRepository) ListScheduleByUserID(userID uint) ([]model.Enrollment, error) {
	var enrollments []model.Enrollment
	err := r.db.Where("user_id = ? AND status = ?", userID, 1).
		Preload("Course").Find(&enrollments).Error
	return enrollments, err
}
