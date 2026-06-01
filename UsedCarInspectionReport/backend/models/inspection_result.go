package models

import (
	"time"
)

type InspectionResult struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	ReportID   uint64    `gorm:"type:bigint unsigned;not null;column:report_id;uniqueIndex:uk_report_item;index:idx_report_id" json:"reportId"`
	ItemID     uint64    `gorm:"type:bigint unsigned;not null;column:item_id;uniqueIndex:uk_report_item;index:idx_item_id" json:"itemId"`
	CategoryID uint64    `gorm:"type:bigint unsigned;not null;column:category_id" json:"categoryId"`
	Result     string    `gorm:"type:enum('ok','attention','abnormal');not null;column:result;index:idx_result" json:"result"`
	Score      int       `gorm:"type:int;not null;column:score" json:"score"`
	Remark     string    `gorm:"type:text;column:remark" json:"remark"`
	CreatedAt  time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP;column:created_at" json:"createdAt"`
	UpdatedAt  time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:updated_at" json:"updatedAt"`

	Item             *InspectionItem  `gorm:"foreignKey:ItemID" json:"item,omitempty"`
	Photos           []InspectionPhoto `gorm:"foreignKey:ResultID" json:"photos,omitempty"`
	RepairSuggestion *RepairSuggestion `gorm:"foreignKey:ResultID" json:"repairSuggestion,omitempty"`
}

func (InspectionResult) TableName() string {
	return "inspection_results"
}
