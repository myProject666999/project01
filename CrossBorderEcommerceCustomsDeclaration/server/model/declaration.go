package model

import (
	"time"
)

type Declaration struct {
	BaseModel
	DeclarationNo     string             `json:"declaration_no" gorm:"type:varchar(50);not null;uniqueIndex"`
	Status            string             `json:"status" gorm:"type:varchar(20);not null;default:draft"`
	TotalAmount       float64            `json:"total_amount" gorm:"type:decimal(12,2);not null"`
	TotalQuantity     int                `json:"total_quantity" gorm:"not null"`
	RejectReason      string             `json:"reject_reason" gorm:"type:varchar(500)"`
	RejectType        string             `json:"reject_type" gorm:"type:varchar(30)"`
	SubmittedAt       *time.Time         `json:"submitted_at" gorm:"type:datetime"`
	ReviewedAt        *time.Time         `json:"reviewed_at" gorm:"type:datetime"`
	ReleasedAt        *time.Time         `json:"released_at" gorm:"type:datetime"`
	DeclarationItems  []DeclarationItem  `json:"declaration_items,omitempty" gorm:"foreignKey:DeclarationID"`
	DeclarationOrders []DeclarationOrder `json:"declaration_orders,omitempty" gorm:"foreignKey:DeclarationID"`
}
