package models

import "time"

type QRCode struct {
	ID         int64      `json:"id" db:"id"`
	QRCode     string     `json:"qr_code" db:"qr_code"`
	ProductID  int64      `json:"product_id" db:"product_id"`
	BatchID    int64      `json:"batch_id" db:"batch_id"`
	ScanCount  int        `json:"scan_count" db:"scan_count"`
	LastScanAt *time.Time `json:"last_scan_at" db:"last_scan_at"`
	Status     int8       `json:"status" db:"status"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
	Product    *Product   `json:"product,omitempty" db:"-"`
	Batch      *HarvestBatch `json:"batch,omitempty" db:"-"`
	ScanURL    string     `json:"scan_url,omitempty" db:"-"`
}

type QRCodeDetail struct {
	ID         int64      `json:"id" db:"id"`
	QRCode     string     `json:"qr_code" db:"qr_code"`
	ProductID  int64      `json:"product_id" db:"product_id"`
	BatchID    int64      `json:"batch_id" db:"batch_id"`
	ScanCount  int        `json:"scan_count" db:"scan_count"`
	LastScanAt *time.Time `json:"last_scan_at" db:"last_scan_at"`
	Status     int8       `json:"status" db:"status"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	ProductCode string    `json:"product_code" db:"product_code"`
	ProductName string    `json:"product_name" db:"product_name"`
	BatchNo    string     `json:"batch_no" db:"batch_no"`
	ScanURL    string     `json:"scan_url,omitempty" db:"-"`
}

type QRCodeGenerateRequest struct {
	ProductID int64 `json:"product_id" validate:"required,min=1"`
	Quantity  int   `json:"quantity" validate:"required,min=1,max=1000"`
}
