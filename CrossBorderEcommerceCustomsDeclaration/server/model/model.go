package model

import (
	"time"

	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func AllModels() []interface{} {
	return []interface{}{
		&Order{}, &OrderItem{}, &HSCode{}, &CategoryMapping{},
		&Declaration{}, &DeclarationItem{}, &DeclarationOrder{},
		&TariffRecord{}, &TariffItem{}, &CustomsArchive{},
	}
}
