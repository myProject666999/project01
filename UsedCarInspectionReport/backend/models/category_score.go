package models

import (
	"time"
)

type CategoryScore struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	ReportID     uint64    `gorm:"type:bigint unsigned;not null;column:report_id;uniqueIndex:uk_report_category" json:"reportId"`
	CategoryID   uint64    `gorm:"type:bigint unsigned;not null;column:category_id;uniqueIndex:uk_report_category" json:"categoryId"`
	CategoryName string    `gorm:"type:varchar(50);not null;column:category_name" json:"categoryName"`
	TotalScore   float64   `gorm:"type:decimal(5,2);not null;column:total_score" json:"totalScore"`
	MaxScore     float64   `gorm:"type:decimal(5,2);not null;column:max_score" json:"maxScore"`
	Percentage   float64   `gorm:"type:decimal(5,2);not null;column:percentage" json:"percentage"`
	CreatedAt    time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP;column:created_at" json:"createdAt"`
}

func (CategoryScore) TableName() string {
	return "category_scores"
}
