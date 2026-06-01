package models

import (
	"time"
)

type RepairSuggestion struct {
	ID                 uint64    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	ResultID           uint64    `gorm:"type:bigint unsigned;not null;column:result_id;index:idx_result_id" json:"resultId"`
	ReportID           uint64    `gorm:"type:bigint unsigned;not null;column:report_id;index:idx_report_id" json:"reportId"`
	ItemName           string    `gorm:"type:varchar(100);not null;column:item_name" json:"itemName"`
	ProblemDescription string    `gorm:"type:text;column:problem_description" json:"problemDescription"`
	Suggestion         string    `gorm:"type:text;column:suggestion" json:"suggestion"`
	EstimatedCost      float64   `gorm:"type:decimal(10,2);column:estimated_cost" json:"estimatedCost"`
	Urgency            string    `gorm:"type:enum('low','medium','high');not null;default:'medium';column:urgency" json:"urgency"`
	CreatedAt          time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP;column:created_at" json:"createdAt"`
	UpdatedAt          time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:updated_at" json:"updatedAt"`
}

func (RepairSuggestion) TableName() string {
	return "repair_suggestions"
}
