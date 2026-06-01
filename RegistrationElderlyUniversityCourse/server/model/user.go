package model

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Phone     string    `json:"phone" gorm:"uniqueIndex;size:20;not null"`
	Password  string    `json:"-" gorm:"size:255;not null"`
	Name      string    `json:"name" gorm:"size:50;not null"`
	Avatar    string    `json:"avatar" gorm:"size:500"`
	Role      int       `json:"role" gorm:"default:0"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
