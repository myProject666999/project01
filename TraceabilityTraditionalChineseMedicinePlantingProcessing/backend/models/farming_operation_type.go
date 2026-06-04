package models

import "time"

type FarmingOperationType struct {
	ID                int64     `json:"id" db:"id"`
	Code              string    `json:"code" db:"code"`
	Name              string    `json:"name" db:"name"`
	Category          string    `json:"category" db:"category"`
	NeedRecordDetail  int8      `json:"need_record_detail" db:"need_record_detail"`
	Description       string    `json:"description" db:"description"`
	SortOrder         int       `json:"sort_order" db:"sort_order"`
	Status            int8      `json:"status" db:"status"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
}

type FarmingOperationTypeCreateRequest struct {
	Code             string `json:"code" validate:"required,max=20"`
	Name             string `json:"name" validate:"required,max=50"`
	Category         string `json:"category" validate:"required,oneof=weeding fertilizing pesticide watering pruning other"`
	NeedRecordDetail int8   `json:"need_record_detail" validate:"oneof=0 1"`
	Description      string `json:"description" validate:"max=200"`
	SortOrder        int    `json:"sort_order"`
	Status           int8   `json:"status" validate:"oneof=0 1"`
}

type FarmingOperationTypeUpdateRequest struct {
	Code             string `json:"code" validate:"omitempty,max=20"`
	Name             string `json:"name" validate:"omitempty,max=50"`
	Category         string `json:"category" validate:"omitempty,oneof=weeding fertilizing pesticide watering pruning other"`
	NeedRecordDetail int8   `json:"need_record_detail" validate:"omitempty,oneof=0 1"`
	Description      string `json:"description" validate:"omitempty,max=200"`
	SortOrder        int    `json:"sort_order"`
	Status           int8   `json:"status" validate:"omitempty,oneof=0 1"`
}
