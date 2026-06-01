package models

import (
	"time"
)

type InspectionItem struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	CategoryID    uint64    `gorm:"type:bigint unsigned;not null;column:category_id;index:idx_category_id" json:"categoryId"`
	Code          string    `gorm:"type:varchar(50);not null;unique;column:code" json:"code"`
	Name          string    `gorm:"type:varchar(100);not null;column:name" json:"name"`
	Description   string    `gorm:"type:text;column:description" json:"description"`
	Standard      string    `gorm:"type:text;column:standard" json:"standard"`
	SortOrder     int       `gorm:"type:int;not null;default:0;column:sort_order" json:"sortOrder"`
	ScoreOk       int       `gorm:"type:int;not null;default:5;column:score_ok" json:"scoreOk"`
	ScoreAttention int      `gorm:"type:int;not null;default:3;column:score_attention" json:"scoreAttention"`
	ScoreAbnormal int       `gorm:"type:int;not null;default:0;column:score_abnormal" json:"scoreAbnormal"`
	NeedPhoto     int8      `gorm:"type:tinyint;not null;default:1;column:need_photo" json:"needPhoto"`
	Status        int8      `gorm:"type:tinyint;not null;default:1;column:status" json:"status"`
	CreatedAt     time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP;column:created_at" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:updated_at" json:"updatedAt"`

	Category *InspectionCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (InspectionItem) TableName() string {
	return "inspection_items"
}
