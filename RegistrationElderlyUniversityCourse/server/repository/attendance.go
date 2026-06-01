package repository

import (
	"server/model"

	"gorm.io/gorm"
)

type AttendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db: db}
}

func (r *AttendanceRepository) ListByUserIDAndMonth(userID uint, month string) ([]model.Attendance, error) {
	var attendances []model.Attendance
	query := r.db.Joins("JOIN enrollments ON enrollments.id = attendances.enrollment_id").
		Where("enrollments.user_id = ? AND enrollments.status = ?", userID, 1)
	if month != "" {
		query = query.Where("attendances.attendance_date LIKE ?", month+"%")
	}
	err := query.Find(&attendances).Error
	return attendances, err
}

func (r *AttendanceRepository) StatsByUserID(userID uint) (map[string]int64, error) {
	var results []struct {
		Status int
		Count  int64
	}
	err := r.db.Model(&model.Attendance{}).
		Select("attendances.status, count(*) as count").
		Joins("JOIN enrollments ON enrollments.id = attendances.enrollment_id").
		Where("enrollments.user_id = ? AND enrollments.status = ?", userID, 1).
		Group("attendances.status").
		Find(&results).Error
	if err != nil {
		return nil, err
	}
	stats := make(map[string]int64)
	for _, r := range results {
		switch r.Status {
		case 1:
			stats["present"] = r.Count
		case 0:
			stats["absent"] = r.Count
		case 2:
			stats["leave"] = r.Count
		}
	}
	return stats, nil
}
