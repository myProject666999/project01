package models

import "time"

type Operator struct {
	ID        int64     `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Phone     string    `json:"phone" db:"phone"`
	Role      string    `json:"role" db:"role"`
	Status    int8      `json:"status" db:"status"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type OperatorCreateRequest struct {
	Name   string `json:"name" validate:"required,max=50"`
	Phone  string `json:"phone" validate:"max=20"`
	Role   string `json:"role" validate:"required,oneof=planter processor manager"`
	Status int8   `json:"status" validate:"oneof=0 1"`
}

type OperatorUpdateRequest struct {
	Name   string `json:"name" validate:"omitempty,max=50"`
	Phone  string `json:"phone" validate:"omitempty,max=20"`
	Role   string `json:"role" validate:"omitempty,oneof=planter processor manager"`
	Status int8   `json:"status" validate:"omitempty,oneof=0 1"`
}
