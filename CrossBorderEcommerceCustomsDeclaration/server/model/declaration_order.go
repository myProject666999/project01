package model

type DeclarationOrder struct {
	ID            uint        `json:"id" gorm:"primaryKey;autoIncrement"`
	DeclarationID uint        `json:"declaration_id" gorm:"not null;index"`
	OrderID       uint        `json:"order_id" gorm:"not null;index"`
	Declaration   Declaration `json:"-" gorm:"foreignKey:DeclarationID"`
	Order         Order       `json:"-" gorm:"foreignKey:OrderID"`
}
