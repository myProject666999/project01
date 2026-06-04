package models

import "time"

type Pesticide struct {
	ID                int64     `json:"id" db:"id"`
	Name              string    `json:"name" db:"name"`
	RegistrationNo    string    `json:"registration_no" db:"registration_no"`
	Manufacturer      string    `json:"manufacturer" db:"manufacturer"`
	SafeIntervalDays  int       `json:"safe_interval_days" db:"safe_interval_days"`
	UsageMethod       string    `json:"usage_method" db:"usage_method"`
	Status            int8      `json:"status" db:"status"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

type PesticideCreateRequest struct {
	Name             string `json:"name" validate:"required,max=100"`
	RegistrationNo   string `json:"registration_no" validate:"max=50"`
	Manufacturer     string `json:"manufacturer" validate:"max=100"`
	SafeIntervalDays int    `json:"safe_interval_days" validate:"required,min=0"`
	UsageMethod      string `json:"usage_method" validate:"max=200"`
	Status           int8   `json:"status" validate:"oneof=0 1"`
}

type PesticideUpdateRequest struct {
	Name             string `json:"name" validate:"omitempty,max=100"`
	RegistrationNo   string `json:"registration_no" validate:"omitempty,max=50"`
	Manufacturer     string `json:"manufacturer" validate:"omitempty,max=100"`
	SafeIntervalDays int    `json:"safe_interval_days" validate:"omitempty,min=0"`
	UsageMethod      string `json:"usage_method" validate:"omitempty,max=200"`
	Status           int8   `json:"status" validate:"omitempty,oneof=0 1"`
}
