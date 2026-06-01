package models

import (
	"time"
)

type InspectionCategory struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	Code        string    `gorm:"type:varchar(50);not null;unique;column:code" json:"code"`
	Name        string    `gorm:"type:varchar(50);not null;column:name" json:"name"`
	Description string    `gorm:"type:varchar(255);column:description" json:"description"`
	SortOrder   int       `gorm:"type:int;not null;default:0;column:sort_order" json:"sortOrder"`
	Weight      float64   `gorm:"type:decimal(5,2);not null;default:1.00;column:weight" json:"weight"`
	Status      int8      `gorm:"type:tinyint;not null;default:1;column:status" json:"status"`
	CreatedAt   time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP;column:created_at" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:updated_at" json:"updatedAt"`

	Items []InspectionItem `gorm:"foreignKey:CategoryID" json:"items,omitempty"`
}

func (InspectionCategory) TableName() string {
	return "inspection_categories"
}
