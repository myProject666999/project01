package model

import "time"

type Club struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"size:100;not null"`
	Description string    `json:"description" gorm:"type:text"`
	Image       string    `json:"image" gorm:"size:500"`
	MemberCount int       `json:"member_count" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type ClubMember struct {
	ID       uint      `json:"id" gorm:"primaryKey"`
	UserID   uint      `json:"user_id" gorm:"index;not null"`
	ClubID   uint      `json:"club_id" gorm:"index;not null"`
	Status   int       `json:"status" gorm:"default:1"`
	JoinedAt time.Time `json:"joined_at"`
}
