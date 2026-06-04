package models

import "time"

type FarmingRecord struct {
	ID                uint64              `json:"id" db:"id"`
	RecordNo          string              `json:"record_no" db:"record_no"`
	PlotID            uint64              `json:"plot_id" db:"plot_id"`
	OperationTypeID   uint64              `json:"operation_type_id" db:"operation_type_id"`
	OperationDate     time.Time           `json:"operation_date" db:"operation_date"`
	OperatorID        uint64              `json:"operator_id" db:"operator_id"`
	FertilizerID      *uint64             `json:"fertilizer_id" db:"fertilizer_id"`
	FertilizerQuantity *float64           `json:"fertilizer_quantity" db:"fertilizer_quantity"`
	PesticideID       *uint64             `json:"pesticide_id" db:"pesticide_id"`
	PesticideQuantity *float64            `json:"pesticide_quantity" db:"pesticide_quantity"`
	SafeIntervalDays  *int                `json:"safe_interval_days" db:"safe_interval_days"`
	OperationDetail   string              `json:"operation_detail" db:"operation_detail"`
	WeatherCondition  string              `json:"weather_condition" db:"weather_condition"`
	Remark            string              `json:"remark" db:"remark"`
	CreatedAt         time.Time           `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time           `json:"updated_at" db:"updated_at"`
	Plot              *Plot               `json:"plot,omitempty" db:"-"`
	OperationType     *FarmingOperationType `json:"operation_type,omitempty" db:"-"`
	Operator          *Operator           `json:"operator,omitempty" db:"-"`
	Fertilizer        *Fertilizer         `json:"fertilizer,omitempty" db:"-"`
	Pesticide         *Pesticide          `json:"pesticide,omitempty" db:"-"`
}

type FarmingRecordDetail struct {
	ID                  uint64    `json:"id" db:"id"`
	RecordNo            string    `json:"record_no" db:"record_no"`
	PlotID              uint64    `json:"plot_id" db:"plot_id"`
	OperationTypeID     uint64    `json:"operation_type_id" db:"operation_type_id"`
	OperationDate       time.Time `json:"operation_date" db:"operation_date"`
	OperatorID          uint64    `json:"operator_id" db:"operator_id"`
	FertilizerID        *uint64   `json:"fertilizer_id" db:"fertilizer_id"`
	FertilizerQuantity  *float64  `json:"fertilizer_quantity" db:"fertilizer_quantity"`
	PesticideID         *uint64   `json:"pesticide_id" db:"pesticide_id"`
	PesticideQuantity   *float64  `json:"pesticide_quantity" db:"pesticide_quantity"`
	SafeIntervalDays    *int      `json:"safe_interval_days" db:"safe_interval_days"`
	OperationDetail     string    `json:"operation_detail" db:"operation_detail"`
	WeatherCondition    string    `json:"weather_condition" db:"weather_condition"`
	Remark              string    `json:"remark" db:"remark"`
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
	PlotCode            string    `json:"plot_code" db:"plot_code"`
	PlotName            string    `json:"plot_name" db:"plot_name"`
	OperationTypeCode   string    `json:"operation_type_code" db:"operation_type_code"`
	OperationTypeName   string    `json:"operation_type_name" db:"operation_type_name"`
	OperationCategory   string    `json:"operation_category" db:"operation_category"`
	OperatorName        string    `json:"operator_name" db:"operator_name"`
	FertilizerName      string    `json:"fertilizer_name" db:"fertilizer_name"`
	PesticideName       string    `json:"pesticide_name" db:"pesticide_name"`
}

type FarmingRecordCreateRequest struct {
	PlotID             uint64   `json:"plot_id" validate:"required,min=1"`
	OperationTypeID    uint64   `json:"operation_type_id" validate:"required,min=1"`
	OperationDate      string   `json:"operation_date" validate:"required"`
	OperatorID         uint64   `json:"operator_id" validate:"required,min=1"`
	FertilizerID       *uint64  `json:"fertilizer_id"`
	FertilizerQuantity *float64 `json:"fertilizer_quantity"`
	PesticideID        *uint64  `json:"pesticide_id"`
	PesticideQuantity  *float64 `json:"pesticide_quantity"`
	OperationDetail    string   `json:"operation_detail"`
	WeatherCondition   string   `json:"weather_condition" validate:"max=100"`
	Remark             string   `json:"remark"`
}

type FarmingRecordUpdateRequest struct {
	PlotID             *uint64  `json:"plot_id" validate:"omitempty,min=1"`
	OperationTypeID    *uint64  `json:"operation_type_id" validate:"omitempty,min=1"`
	OperationDate      string   `json:"operation_date"`
	OperatorID         *uint64  `json:"operator_id" validate:"omitempty,min=1"`
	FertilizerID       *uint64  `json:"fertilizer_id"`
	FertilizerQuantity *float64 `json:"fertilizer_quantity"`
	PesticideID        *uint64  `json:"pesticide_id"`
	PesticideQuantity  *float64 `json:"pesticide_quantity"`
	OperationDetail    string   `json:"operation_detail"`
	WeatherCondition   string   `json:"weather_condition" validate:"omitempty,max=100"`
	Remark             string   `json:"remark"`
}
