package model

import "time"

type CustomsArchive struct {
	ID            uint        `json:"id" gorm:"primaryKey;autoIncrement"`
	DeclarationID uint        `json:"declaration_id" gorm:"not null;index"`
	Declaration   Declaration `json:"-" gorm:"foreignKey:DeclarationID"`
	DeclarationNo string      `json:"declaration_no" gorm:"type:varchar(50);not null"`
	ArchiveNo     string      `json:"archive_no" gorm:"type:varchar(50);not null;uniqueIndex"`
	ArchiveDate   time.Time   `json:"archive_date" gorm:"type:datetime;not null"`
	DocumentURL   string      `json:"document_url" gorm:"type:varchar(500);not null"`
	Status        string      `json:"status" gorm:"type:varchar(20);not null"`
	CreatedAt     time.Time   `json:"created_at" gorm:"type:datetime;autoCreateTime"`
}
