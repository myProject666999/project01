package model

import "time"

type Course struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Name          string    `json:"name" gorm:"size:100;not null"`
	Category      string    `json:"category" gorm:"size:50"`
	Teacher       string    `json:"teacher" gorm:"size:50"`
	Description   string    `json:"description" gorm:"type:text"`
	ScheduleDay   string    `json:"schedule_day" gorm:"column:schedule_day;size:20;not null"`
	ScheduleTime  string    `json:"schedule_time" gorm:"column:schedule_time;size:50;not null"`
	Classroom     string    `json:"classroom" gorm:"size:100;not null"`
	Capacity      int       `json:"capacity" gorm:"not null;default:30"`
	EnrolledCount int       `json:"enrolled_count" gorm:"default:0"`
	Status        int       `json:"status" gorm:"default:1"`
	Image         string    `json:"image" gorm:"size:500"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
