package models

import (
	"time"
)

type InspectionPhoto struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	ResultID  uint64    `gorm:"type:bigint unsigned;not null;column:result_id;index:idx_result_id" json:"resultId"`
	ReportID  uint64    `gorm:"type:bigint unsigned;not null;column:report_id;index:idx_report_id" json:"reportId"`
	ItemID    uint64    `gorm:"type:bigint unsigned;not null;column:item_id;index:idx_item_id" json:"itemId"`
	FilePath  string    `gorm:"type:varchar(255);not null;column:file_path" json:"filePath"`
	FileName  string    `gorm:"type:varchar(255);not null;column:file_name" json:"fileName"`
	FileSize  int64     `gorm:"type:bigint;column:file_size" json:"fileSize"`
	SortOrder int       `gorm:"type:int;not null;default:0;column:sort_order" json:"sortOrder"`
	CreatedAt time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP;column:created_at" json:"createdAt"`
}

func (InspectionPhoto) TableName() string {
	return "inspection_photos"
}
