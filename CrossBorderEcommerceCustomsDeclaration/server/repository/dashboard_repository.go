package repository

import (
	"customs-declaration/model"

	"gorm.io/gorm"
)

type DashboardRepo struct {
	DB *gorm.DB
}

func (r *DashboardRepo) GetStats() (todayDeclared, pendingReview, released, rejected int64) {
	r.DB.Model(&model.Declaration{}).
		Where("DATE(created_at) = CURDATE()").
		Count(&todayDeclared)

	r.DB.Model(&model.Declaration{}).
		Where("status = ?", "pending_review").
		Count(&pendingReview)

	r.DB.Model(&model.Declaration{}).
		Where("status = ?", "released").
		Count(&released)

	r.DB.Model(&model.Declaration{}).
		Where("status = ?", "rejected").
		Count(&rejected)

	return
}

func (r *DashboardRepo) GetPendingTasks(limit int) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	err := r.DB.Model(&model.Declaration{}).
		Select("id, declaration_no, status, created_at").
		Where("status IN ?", []string{"pending_review", "pending_declare"}).
		Order("created_at ASC").
		Limit(limit).
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	return results, nil
}

func (r *DashboardRepo) GetTrend(days int) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	err := r.DB.Model(&model.Declaration{}).
		Select("DATE(created_at) AS date, COUNT(*) AS count").
		Where("created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)", days).
		Group("DATE(created_at)").
		Order("date ASC").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	return results, nil
}
