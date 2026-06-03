package model

import (
	"time"
)

type TariffRecord struct {
	BaseModel
	DeclarationID  uint         `json:"declaration_id" gorm:"not null;index"`
	Declaration    Declaration  `json:"-" gorm:"foreignKey:DeclarationID"`
	DeclarationNo  string       `json:"declaration_no" gorm:"type:varchar(50);not null"`
	TariffAmount   float64      `json:"tariff_amount" gorm:"type:decimal(12,2);not null"`
	Currency       string       `json:"currency" gorm:"type:varchar(10);not null"`
	PaymentStatus  string       `json:"payment_status" gorm:"type:varchar(20);not null;default:unpaid"`
	PaymentDate    *time.Time   `json:"payment_date" gorm:"type:datetime"`
	TariffItems    []TariffItem `json:"tariff_items,omitempty" gorm:"foreignKey:TariffRecordID"`
}
