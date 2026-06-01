package repository

import (
	"server/model"

	"gorm.io/gorm"
)

type WaitlistRepository struct {
	db *gorm.DB
}

func NewWaitlistRepository(db *gorm.DB) *WaitlistRepository {
	return &WaitlistRepository{db: db}
}

func (r *WaitlistRepository) Create(waitlist *model.Waitlist) error {
	return r.db.Create(waitlist).Error
}

func (r *WaitlistRepository) FindByUserAndCourse(userID, courseID uint) (*model.Waitlist, error) {
	var waitlist model.Waitlist
	err := r.db.Where("user_id = ? AND course_id = ? AND status = ?", userID, courseID, 1).First(&waitlist).Error
	if err != nil {
		return nil, err
	}
	return &waitlist, nil
}

func (r *WaitlistRepository) ListByUserID(userID uint) ([]model.Waitlist, error) {
	var waitlists []model.Waitlist
	err := r.db.Where("user_id = ? AND status = ?", userID, 1).
		Preload("Course").Find(&waitlists).Error
	return waitlists, err
}

func (r *WaitlistRepository) UpdateStatus(userID, courseID uint, status int) error {
	return r.db.Model(&model.Waitlist{}).
		Where("user_id = ? AND course_id = ? AND status = ?", userID, courseID, 1).
		Update("status", status).Error
}

func (r *WaitlistRepository) CountByCourseID(courseID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.Waitlist{}).Where("course_id = ? AND status = ?", courseID, 1).Count(&count).Error
	return count, err
}
