package model

import "time"

type Activity struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	ClubID          uint      `json:"club_id" gorm:"index;not null"`
	Title           string    `json:"title" gorm:"size:200;not null"`
	Description     string    `json:"description" gorm:"type:text"`
	Location        string    `json:"location" gorm:"size:200;not null"`
	StartTime       time.Time `json:"start_time"`
	EndTime         time.Time `json:"end_time"`
	Capacity        int       `json:"capacity" gorm:"default:50"`
	RegisteredCount int       `json:"registered_count" gorm:"default:0"`
	Status          int       `json:"status" gorm:"default:1"`
	CreatedAt       time.Time `json:"created_at"`
	Club            Club      `json:"club,omitempty" gorm:"foreignKey:ClubID"`
}

type ActivityRegistration struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UserID     uint      `json:"user_id" gorm:"index;not null"`
	ActivityID uint      `json:"activity_id" gorm:"index;not null"`
	Status     int       `json:"status" gorm:"default:1"`
	CreatedAt  time.Time `json:"created_at"`
}
