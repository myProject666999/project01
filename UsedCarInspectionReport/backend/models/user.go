package models

import (
	"time"
)

type User struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	Username  string    `gorm:"type:varchar(50);not null;unique;column:username" json:"username"`
	Password  string    `gorm:"type:varchar(255);not null;column:password" json:"-"`
	RealName  string    `gorm:"type:varchar(50);not null;column:real_name" json:"realName"`
	Phone     string    `gorm:"type:varchar(20);column:phone" json:"phone"`
	Role      string    `gorm:"type:enum('admin','inspector');not null;default:'inspector';column:role" json:"role"`
	Status    int8      `gorm:"type:tinyint;not null;default:1;column:status" json:"status"`
	CreatedAt time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP;column:created_at" json:"createdAt"`
	UpdatedAt time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:updated_at" json:"updatedAt"`
}

func (User) TableName() string {
	return "users"
}
