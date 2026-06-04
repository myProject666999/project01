package models

import "time"

type HarvestBatch struct {
	ID              uint64       `json:"id" db:"id"`
	BatchNo         string       `json:"batch_no" db:"batch_no"`
	PlotID          uint64       `json:"plot_id" db:"plot_id"`
	VarietyID       uint64       `json:"variety_id" db:"variety_id"`
	HarvestDate     time.Time    `json:"harvest_date" db:"harvest_date"`
	Quantity        float64      `json:"quantity" db:"quantity"`
	QualityLevel    string       `json:"quality_level" db:"quality_level"`
	OperatorID      uint64       `json:"operator_id" db:"operator_id"`
	HarvestMethod   string       `json:"harvest_method" db:"harvest_method"`
	WeatherCondition string      `json:"weather_condition" db:"weather_condition"`
	SafeCheckPassed int8         `json:"safe_check_passed" db:"safe_check_passed"`
	SafeCheckRemark string       `json:"safe_check_remark" db:"safe_check_remark"`
	Status          int8         `json:"status" db:"status"`
	Remark          string       `json:"remark" db:"remark"`
	CreatedAt       time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at" db:"updated_at"`
	Plot            *Plot        `json:"plot,omitempty" db:"-"`
	Variety         *HerbVariety `json:"variety,omitempty" db:"-"`
	Operator        *Operator    `json:"operator,omitempty" db:"-"`
}

type HarvestBatchDetail struct {
	ID               uint64    `json:"id" db:"id"`
	BatchNo          string    `json:"batch_no" db:"batch_no"`
	PlotID           uint64    `json:"plot_id" db:"plot_id"`
	VarietyID        uint64    `json:"variety_id" db:"variety_id"`
	HarvestDate      time.Time `json:"harvest_date" db:"harvest_date"`
	Quantity         float64   `json:"quantity" db:"quantity"`
	QualityLevel     string    `json:"quality_level" db:"quality_level"`
	OperatorID       uint64    `json:"operator_id" db:"operator_id"`
	HarvestMethod    string    `json:"harvest_method" db:"harvest_method"`
	WeatherCondition string    `json:"weather_condition" db:"weather_condition"`
	SafeCheckPassed  int8      `json:"safe_check_passed" db:"safe_check_passed"`
	SafeCheckRemark  string    `json:"safe_check_remark" db:"safe_check_remark"`
	Status           int8      `json:"status" db:"status"`
	Remark           string    `json:"remark" db:"remark"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
	PlotCode         string    `json:"plot_code" db:"plot_code"`
	PlotName         string    `json:"plot_name" db:"plot_name"`
	VarietyCode      string    `json:"variety_code" db:"variety_code"`
	VarietyName      string    `json:"variety_name" db:"variety_name"`
	OperatorName     string    `json:"operator_name" db:"operator_name"`
}

type HarvestBatchCreateRequest struct {
	PlotID           uint64  `json:"plot_id" validate:"required,min=1"`
	VarietyID        uint64  `json:"variety_id" validate:"required,min=1"`
	HarvestDate      string  `json:"harvest_date" validate:"required"`
	Quantity         float64 `json:"quantity" validate:"required,min=0"`
	QualityLevel     string  `json:"quality_level" validate:"max=20"`
	OperatorID       uint64  `json:"operator_id" validate:"required,min=1"`
	HarvestMethod    string  `json:"harvest_method" validate:"max=100"`
	WeatherCondition string  `json:"weather_condition" validate:"max=100"`
	Status           int8    `json:"status" validate:"oneof=0 1 2 3"`
	Remark           string  `json:"remark"`
}

type HarvestBatchUpdateRequest struct {
	PlotID           *uint64  `json:"plot_id" validate:"omitempty,min=1"`
	VarietyID        *uint64  `json:"variety_id" validate:"omitempty,min=1"`
	HarvestDate      string   `json:"harvest_date"`
	Quantity         *float64 `json:"quantity" validate:"omitempty,min=0"`
	QualityLevel     string   `json:"quality_level" validate:"omitempty,max=20"`
	OperatorID       *uint64  `json:"operator_id" validate:"omitempty,min=1"`
	HarvestMethod    string   `json:"harvest_method" validate:"omitempty,max=100"`
	WeatherCondition string   `json:"weather_condition" validate:"omitempty,max=100"`
	Status           int8     `json:"status" validate:"omitempty,oneof=0 1 2 3"`
	Remark           string   `json:"remark"`
}
