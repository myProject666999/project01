package models

import "time"

type HerbVariety struct {
	ID              int64     `json:"id" db:"id"`
	Code            string    `json:"code" db:"code"`
	Name            string    `json:"name" db:"name"`
	Alias           string    `json:"alias" db:"alias"`
	ScientificName  string    `json:"scientific_name" db:"scientific_name"`
	Origin          string    `json:"origin" db:"origin"`
	GrowthCycleDays int       `json:"growth_cycle_days" db:"growth_cycle_days"`
	Description     string    `json:"description" db:"description"`
	Status          int8      `json:"status" db:"status"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

type HerbVarietyCreateRequest struct {
	Code            string `json:"code" validate:"required,max=20"`
	Name            string `json:"name" validate:"required,max=100"`
	Alias           string `json:"alias" validate:"max=100"`
	ScientificName  string `json:"scientific_name" validate:"max=100"`
	Origin          string `json:"origin" validate:"max=100"`
	GrowthCycleDays int    `json:"growth_cycle_days" validate:"min=0"`
	Description     string `json:"description"`
	Status          int8   `json:"status" validate:"oneof=0 1"`
}

type HerbVarietyUpdateRequest struct {
	Code            string `json:"code" validate:"omitempty,max=20"`
	Name            string `json:"name" validate:"omitempty,required,max=100"`
	Alias           string `json:"alias" validate:"omitempty,max=100"`
	ScientificName  string `json:"scientific_name" validate:"omitempty,max=100"`
	Origin          string `json:"origin" validate:"omitempty,max=100"`
	GrowthCycleDays int    `json:"growth_cycle_days" validate:"omitempty,min=0"`
	Description     string `json:"description"`
	Status          int8   `json:"status" validate:"omitempty,oneof=0 1"`
}
