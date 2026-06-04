package models

import "time"

type ProcessingRecord struct {
	ID                 uint64              `json:"id" db:"id"`
	RecordNo           string              `json:"record_no" db:"record_no"`
	BatchID            uint64              `json:"batch_id" db:"batch_id"`
	StepTypeID         uint64              `json:"step_type_id" db:"step_type_id"`
	StartTime          time.Time           `json:"start_time" db:"start_time"`
	EndTime            *time.Time          `json:"end_time" db:"end_time"`
	DurationMinutes    *int                `json:"duration_minutes" db:"duration_minutes"`
	Temperature        *float64            `json:"temperature" db:"temperature"`
	OperatorID         uint64              `json:"operator_id" db:"operator_id"`
	ProcessingDetail   string              `json:"processing_detail" db:"processing_detail"`
	InputQuantity      *float64            `json:"input_quantity" db:"input_quantity"`
	OutputQuantity     *float64            `json:"output_quantity" db:"output_quantity"`
	QualityCheckResult string              `json:"quality_check_result" db:"quality_check_result"`
	QualityCheckRemark string              `json:"quality_check_remark" db:"quality_check_remark"`
	Remark             string              `json:"remark" db:"remark"`
	CreatedAt          time.Time           `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time           `json:"updated_at" db:"updated_at"`
	Batch              *HarvestBatch       `json:"batch,omitempty" db:"-"`
	StepType           *ProcessingStepType `json:"step_type,omitempty" db:"-"`
	Operator           *Operator           `json:"operator,omitempty" db:"-"`
}

type ProcessingRecordDetail struct {
	ID                 uint64    `json:"id" db:"id"`
	RecordNo           string    `json:"record_no" db:"record_no"`
	BatchID            uint64    `json:"batch_id" db:"batch_id"`
	StepTypeID         uint64    `json:"step_type_id" db:"step_type_id"`
	StartTime          time.Time `json:"start_time" db:"start_time"`
	EndTime            *time.Time `json:"end_time" db:"end_time"`
	DurationMinutes    *int       `json:"duration_minutes" db:"duration_minutes"`
	Temperature        *float64   `json:"temperature" db:"temperature"`
	OperatorID         uint64     `json:"operator_id" db:"operator_id"`
	ProcessingDetail   string     `json:"processing_detail" db:"processing_detail"`
	InputQuantity      *float64   `json:"input_quantity" db:"input_quantity"`
	OutputQuantity     *float64   `json:"output_quantity" db:"output_quantity"`
	QualityCheckResult string     `json:"quality_check_result" db:"quality_check_result"`
	QualityCheckRemark string     `json:"quality_check_remark" db:"quality_check_remark"`
	Remark             string     `json:"remark" db:"remark"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at" db:"updated_at"`
	BatchNo            string     `json:"batch_no" db:"batch_no"`
	StepTypeCode       string     `json:"step_type_code" db:"step_type_code"`
	StepTypeName       string     `json:"step_type_name" db:"step_type_name"`
	StepTypeCategory   string     `json:"step_type_category" db:"step_type_category"`
	OperatorName       string     `json:"operator_name" db:"operator_name"`
}

type ProcessingRecordCreateRequest struct {
	BatchID            uint64   `json:"batch_id" validate:"required,min=1"`
	StepTypeID         uint64   `json:"step_type_id" validate:"required,min=1"`
	StartTime          string   `json:"start_time" validate:"required"`
	EndTime            string   `json:"end_time"`
	Temperature        *float64 `json:"temperature"`
	OperatorID         uint64   `json:"operator_id" validate:"required,min=1"`
	ProcessingDetail   string   `json:"processing_detail"`
	InputQuantity      *float64 `json:"input_quantity"`
	OutputQuantity     *float64 `json:"output_quantity"`
	QualityCheckResult string   `json:"quality_check_result" validate:"max=20"`
	QualityCheckRemark string   `json:"quality_check_remark"`
	Remark             string   `json:"remark"`
}

type ProcessingRecordUpdateRequest struct {
	BatchID            *uint64  `json:"batch_id" validate:"omitempty,min=1"`
	StepTypeID         *uint64  `json:"step_type_id" validate:"omitempty,min=1"`
	StartTime          string   `json:"start_time"`
	EndTime            string   `json:"end_time"`
	Temperature        *float64 `json:"temperature"`
	OperatorID         *uint64  `json:"operator_id" validate:"omitempty,min=1"`
	ProcessingDetail   string   `json:"processing_detail"`
	InputQuantity      *float64 `json:"input_quantity"`
	OutputQuantity     *float64 `json:"output_quantity"`
	QualityCheckResult string   `json:"quality_check_result" validate:"omitempty,max=20"`
	QualityCheckRemark string   `json:"quality_check_remark"`
	Remark             string   `json:"remark"`
}
