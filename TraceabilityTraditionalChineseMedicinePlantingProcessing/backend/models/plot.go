package models

import "time"

type Plot struct {
	ID                  int64        `json:"id" db:"id"`
	PlotCode            string       `json:"plot_code" db:"plot_code"`
	Name                string       `json:"name" db:"name"`
	Province            string       `json:"province" db:"province"`
	City                string       `json:"city" db:"city"`
	District            string       `json:"district" db:"district"`
	Address             string       `json:"address" db:"address"`
	Longitude           float64      `json:"longitude" db:"longitude"`
	Latitude            float64      `json:"latitude" db:"latitude"`
	Altitude            *float64     `json:"altitude" db:"altitude"`
	SoilType            string       `json:"soil_type" db:"soil_type"`
	SoilPh              *float64     `json:"soil_ph" db:"soil_ph"`
	Area                *float64     `json:"area" db:"area"`
	SeedlingSource      string       `json:"seedling_source" db:"seedling_source"`
	VarietyID           int64        `json:"variety_id" db:"variety_id"`
	PlantingDate        *time.Time   `json:"planting_date" db:"planting_date"`
	ExpectedHarvestDate *time.Time   `json:"expected_harvest_date" db:"expected_harvest_date"`
	OperatorID          *int64       `json:"operator_id" db:"operator_id"`
	Status              int8         `json:"status" db:"status"`
	Remark              string       `json:"remark" db:"remark"`
	CreatedAt           time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time    `json:"updated_at" db:"updated_at"`
	Variety             *HerbVariety `json:"variety,omitempty" db:"-"`
	Operator            *Operator    `json:"operator,omitempty" db:"-"`
}

type PlotDetail struct {
	ID                  int64        `json:"id" db:"id"`
	PlotCode            string       `json:"plot_code" db:"plot_code"`
	Name                string       `json:"name" db:"name"`
	Province            string       `json:"province" db:"province"`
	City                string       `json:"city" db:"city"`
	District            string       `json:"district" db:"district"`
	Address             string       `json:"address" db:"address"`
	Longitude           float64      `json:"longitude" db:"longitude"`
	Latitude            float64      `json:"latitude" db:"latitude"`
	Altitude            *float64     `json:"altitude" db:"altitude"`
	SoilType            string       `json:"soil_type" db:"soil_type"`
	SoilPh              *float64     `json:"soil_ph" db:"soil_ph"`
	Area                *float64     `json:"area" db:"area"`
	SeedlingSource      string       `json:"seedling_source" db:"seedling_source"`
	VarietyID           int64        `json:"variety_id" db:"variety_id"`
	PlantingDate        *time.Time   `json:"planting_date" db:"planting_date"`
	ExpectedHarvestDate *time.Time   `json:"expected_harvest_date" db:"expected_harvest_date"`
	OperatorID          *int64       `json:"operator_id" db:"operator_id"`
	Status              int8         `json:"status" db:"status"`
	Remark              string       `json:"remark" db:"remark"`
	CreatedAt           time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time    `json:"updated_at" db:"updated_at"`
	VarietyCode         string       `json:"variety_code" db:"variety_code"`
	VarietyName         string       `json:"variety_name" db:"variety_name"`
	OperatorName        string       `json:"operator_name" db:"operator_name"`
	OperatorPhone       string       `json:"operator_phone" db:"operator_phone"`
}

type PlotCreateRequest struct {
	Name                string     `json:"name" validate:"required,max=100"`
	Province            string     `json:"province" validate:"required,max=50"`
	City                string     `json:"city" validate:"max=50"`
	District            string     `json:"district" validate:"max=50"`
	Address             string     `json:"address" validate:"max=200"`
	Longitude           float64    `json:"longitude" validate:"required"`
	Latitude            float64    `json:"latitude" validate:"required"`
	Altitude            *float64   `json:"altitude"`
	SoilType            string     `json:"soil_type" validate:"max=50"`
	SoilPh              *float64   `json:"soil_ph"`
	Area                *float64   `json:"area"`
	SeedlingSource      string     `json:"seedling_source" validate:"required,max=200"`
	VarietyID           int64      `json:"variety_id" validate:"required,min=1"`
	PlantingDate        string     `json:"planting_date"`
	ExpectedHarvestDate string     `json:"expected_harvest_date"`
	OperatorID          *int64     `json:"operator_id"`
	Status              int8       `json:"status" validate:"oneof=0 1 2"`
	Remark              string     `json:"remark"`
}

type PlotUpdateRequest struct {
	Name                string     `json:"name" validate:"omitempty,max=100"`
	Province            string     `json:"province" validate:"omitempty,max=50"`
	City                string     `json:"city" validate:"omitempty,max=50"`
	District            string     `json:"district" validate:"omitempty,max=50"`
	Address             string     `json:"address" validate:"omitempty,max=200"`
	Longitude           *float64   `json:"longitude"`
	Latitude            *float64   `json:"latitude"`
	Altitude            *float64   `json:"altitude"`
	SoilType            string     `json:"soil_type" validate:"omitempty,max=50"`
	SoilPh              *float64   `json:"soil_ph"`
	Area                *float64   `json:"area"`
	SeedlingSource      string     `json:"seedling_source" validate:"omitempty,max=200"`
	VarietyID           *int64     `json:"variety_id"`
	PlantingDate        string     `json:"planting_date"`
	ExpectedHarvestDate string     `json:"expected_harvest_date"`
	OperatorID          *int64     `json:"operator_id"`
	Status              int8       `json:"status" validate:"omitempty,oneof=0 1 2"`
	Remark              string     `json:"remark"`
}
