package models

import (
	"time"
)

type Vehicle struct {
	ID                   uint64    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	Vin                  string    `gorm:"type:varchar(17);not null;unique;column:vin" json:"vin"`
	Brand                string    `gorm:"type:varchar(50);not null;column:brand" json:"brand"`
	Model                string    `gorm:"type:varchar(100);not null;column:model" json:"model"`
	Year                 int       `gorm:"type:int;column:year" json:"year"`
	Mileage              int       `gorm:"type:int;column:mileage" json:"mileage"`
	LicensePlate         string    `gorm:"type:varchar(20);column:license_plate" json:"licensePlate"`
	Color                string    `gorm:"type:varchar(20);column:color" json:"color"`
	FirstRegistrationDate string   `gorm:"type:date;column:first_registration_date" json:"firstRegistrationDate"`
	CreatedAt            time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP;column:created_at" json:"createdAt"`
	UpdatedAt            time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:updated_at" json:"updatedAt"`
}

func (Vehicle) TableName() string {
	return "vehicles"
}
