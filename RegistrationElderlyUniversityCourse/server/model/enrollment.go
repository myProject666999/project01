package model

import "time"

type Enrollment struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"index;not null"`
	CourseID  uint      `json:"course_id" gorm:"index;not null"`
	Status    int       `json:"status" gorm:"default:1"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Course    Course    `json:"course,omitempty" gorm:"foreignKey:CourseID"`
}
