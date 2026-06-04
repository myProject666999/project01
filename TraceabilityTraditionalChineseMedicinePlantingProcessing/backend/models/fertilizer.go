package models

import "time"

type Fertilizer struct {
	ID             int64     `json:"id" db:"id"`
	Name           string    `json:"name" db:"name"`
	Type           string    `json:"type" db:"type"`
	Manufacturer   string    `json:"manufacturer" db:"manufacturer"`
	NutrientContent string   `json:"nutrient_content" db:"nutrient_content"`
	Status         int8      `json:"status" db:"status"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

type FertilizerCreateRequest struct {
	Name            string `json:"name" validate:"required,max=100"`
	Type            string `json:"type" validate:"max=50"`
	Manufacturer    string `json:"manufacturer" validate:"max=100"`
	NutrientContent string `json:"nutrient_content" validate:"max=100"`
	Status          int8   `json:"status" validate:"oneof=0 1"`
}

type FertilizerUpdateRequest struct {
	Name            string `json:"name" validate:"omitempty,max=100"`
	Type            string `json:"type" validate:"omitempty,max=50"`
	Manufacturer    string `json:"manufacturer" validate:"omitempty,max=100"`
	NutrientContent string `json:"nutrient_content" validate:"omitempty,max=100"`
	Status          int8   `json:"status" validate:"omitempty,oneof=0 1"`
}
