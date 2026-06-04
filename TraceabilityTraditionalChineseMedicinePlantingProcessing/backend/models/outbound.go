package models

import "time"

type OutboundRecord struct {
	ID              int64      `json:"id" db:"id"`
	OutboundNo      string     `json:"outbound_no" db:"outbound_no"`
	ProductID       int64      `json:"product_id" db:"product_id"`
	BatchID         int64      `json:"batch_id" db:"batch_id"`
	Quantity        int        `json:"quantity" db:"quantity"`
	OutboundDate    time.Time  `json:"outbound_date" db:"outbound_date"`
	Receiver        string     `json:"receiver" db:"receiver"`
	OperatorID      int64      `json:"operator_id" db:"operator_id"`
	SafeCheckPassed int8       `json:"safe_check_passed" db:"safe_check_passed"`
	SafeCheckDetail string     `json:"safe_check_detail" db:"safe_check_detail"`
	Remark          string     `json:"remark" db:"remark"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	Product         *Product   `json:"product,omitempty" db:"-"`
	Batch           *HarvestBatch `json:"batch,omitempty" db:"-"`
	Operator        *Operator  `json:"operator,omitempty" db:"-"`
}

type OutboundRecordDetail struct {
	ID              int64      `json:"id" db:"id"`
	OutboundNo      string     `json:"outbound_no" db:"outbound_no"`
	ProductID       int64      `json:"product_id" db:"product_id"`
	BatchID         int64      `json:"batch_id" db:"batch_id"`
	Quantity        int        `json:"quantity" db:"quantity"`
	OutboundDate    time.Time  `json:"outbound_date" db:"outbound_date"`
	Receiver        string     `json:"receiver" db:"receiver"`
	OperatorID      int64      `json:"operator_id" db:"operator_id"`
	SafeCheckPassed int8       `json:"safe_check_passed" db:"safe_check_passed"`
	SafeCheckDetail string     `json:"safe_check_detail" db:"safe_check_detail"`
	Remark          string     `json:"remark" db:"remark"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	ProductCode     string     `json:"product_code" db:"product_code"`
	ProductName     string     `json:"product_name" db:"product_name"`
	BatchNo         string     `json:"batch_no" db:"batch_no"`
	OperatorName    string     `json:"operator_name" db:"operator_name"`
}

type OutboundCreateRequest struct {
	ProductID  int64  `json:"product_id" validate:"required,min=1"`
	Quantity   int    `json:"quantity" validate:"required,min=1"`
	Receiver   string `json:"receiver"`
	OperatorID int64  `json:"operator_id" validate:"required,min=1"`
	Remark     string `json:"remark"`
}

type SafetyCheckResponse struct {
	Passed bool   `json:"passed"`
	Reason string `json:"reason"`
}
