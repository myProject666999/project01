package model

import (
	"time"
)

type Order struct {
	BaseModel
	PlatformOrderID string      `json:"platform_order_id" gorm:"type:varchar(100);not null;uniqueIndex"`
	Platform        string      `json:"platform" gorm:"type:varchar(20);not null"`
	OrderDate       *time.Time  `json:"order_date" gorm:"type:datetime"`
	CustomerName    string      `json:"customer_name" gorm:"type:varchar(100);not null"`
	TotalAmount     float64     `json:"total_amount" gorm:"type:decimal(12,2);not null"`
	Currency        string      `json:"currency" gorm:"type:varchar(10);not null"`
	Status          string      `json:"status" gorm:"type:varchar(20);not null;default:pending"`
	OrderItems      []OrderItem `json:"order_items,omitempty" gorm:"foreignKey:OrderID"`
}
