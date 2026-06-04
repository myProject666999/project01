package models

import "time"

type ProcessingStepType struct {
	ID                    int64      `json:"id" db:"id"`
	Code                  string     `json:"code" db:"code"`
	Name                  string     `json:"name" db:"name"`
	Category              string     `json:"category" db:"category"`
	NeedTemperature       int8       `json:"need_temperature" db:"need_temperature"`
	NeedTime              int8       `json:"need_time" db:"need_time"`
	StandardTemperatureMin *float64  `json:"standard_temperature_min" db:"standard_temperature_min"`
	StandardTemperatureMax *float64  `json:"standard_temperature_max" db:"standard_temperature_max"`
	StandardTimeMin       *int       `json:"standard_time_min" db:"standard_time_min"`
	StandardTimeMax       *int       `json:"standard_time_max" db:"standard_time_max"`
	Description           string     `json:"description" db:"description"`
	SortOrder             int        `json:"sort_order" db:"sort_order"`
	Status                int8       `json:"status" db:"status"`
	CreatedAt             time.Time  `json:"created_at" db:"created_at"`
}

type ProcessingStepTypeCreateRequest struct {
	Code                  string   `json:"code" validate:"required,max=20"`
	Name                  string   `json:"name" validate:"required,max=50"`
	Category              string   `json:"category" validate:"required,oneof=cleaning cutting processing drying packaging other"`
	NeedTemperature       int8     `json:"need_temperature" validate:"oneof=0 1"`
	NeedTime              int8     `json:"need_time" validate:"oneof=0 1"`
	StandardTemperatureMin *float64 `json:"standard_temperature_min"`
	StandardTemperatureMax *float64 `json:"standard_temperature_max"`
	StandardTimeMin       *int     `json:"standard_time_min"`
	StandardTimeMax       *int     `json:"standard_time_max"`
	Description           string   `json:"description" validate:"max=200"`
	SortOrder             int      `json:"sort_order"`
	Status                int8     `json:"status" validate:"oneof=0 1"`
}

type ProcessingStepTypeUpdateRequest struct {
	Code                  string   `json:"code" validate:"omitempty,max=20"`
	Name                  string   `json:"name" validate:"omitempty,max=50"`
	Category              string   `json:"category" validate:"omitempty,oneof=cleaning cutting processing drying packaging other"`
	NeedTemperature       int8     `json:"need_temperature" validate:"omitempty,oneof=0 1"`
	NeedTime              int8     `json:"need_time" validate:"omitempty,oneof=0 1"`
	StandardTemperatureMin *float64 `json:"standard_temperature_min"`
	StandardTemperatureMax *float64 `json:"standard_temperature_max"`
	StandardTimeMin       *int     `json:"standard_time_min"`
	StandardTimeMax       *int     `json:"standard_time_max"`
	Description           string   `json:"description" validate:"omitempty,max=200"`
	SortOrder             int      `json:"sort_order"`
	Status                int8     `json:"status" validate:"omitempty,oneof=0 1"`
}
