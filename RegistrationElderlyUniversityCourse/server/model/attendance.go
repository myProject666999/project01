package model

import "time"

type Attendance struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	EnrollmentID   uint      `json:"enrollment_id" gorm:"index;not null"`
	AttendanceDate string    `json:"attendance_date" gorm:"column:attendance_date;type:date;not null"`
	Status         int       `json:"status" gorm:"default:1"`
	Remark         string    `json:"remark" gorm:"size:200"`
	CreatedAt      time.Time `json:"created_at"`
}
