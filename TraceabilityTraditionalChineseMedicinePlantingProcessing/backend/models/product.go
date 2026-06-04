package models

import "time"

type Product struct {
	ID                int64        `json:"id" db:"id"`
	ProductCode       string       `json:"product_code" db:"product_code"`
	ProductName       string       `json:"product_name" db:"product_name"`
	BatchID           int64        `json:"batch_id" db:"batch_id"`
	Specification     string       `json:"specification" db:"specification"`
	PackageType       string       `json:"package_type" db:"package_type"`
	NetWeight         *float64     `json:"net_weight" db:"net_weight"`
	ProductionDate    *time.Time   `json:"production_date" db:"production_date"`
	ShelfLifeMonths   *int         `json:"shelf_life_months" db:"shelf_life_months"`
	StorageCondition  string       `json:"storage_condition" db:"storage_condition"`
	TotalQuantity     int          `json:"total_quantity" db:"total_quantity"`
	AvailableQuantity int          `json:"available_quantity" db:"available_quantity"`
	Status            int8         `json:"status" db:"status"`
	Remark            string       `json:"remark" db:"remark"`
	CreatedAt         time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time    `json:"updated_at" db:"updated_at"`
	Batch             *HarvestBatch `json:"batch,omitempty" db:"-"`
}

type ProductDetail struct {
	ID                int64        `json:"id" db:"id"`
	ProductCode       string       `json:"product_code" db:"product_code"`
	ProductName       string       `json:"product_name" db:"product_name"`
	BatchID           int64        `json:"batch_id" db:"batch_id"`
	Specification     string       `json:"specification" db:"specification"`
	PackageType       string       `json:"package_type" db:"package_type"`
	NetWeight         *float64     `json:"net_weight" db:"net_weight"`
	ProductionDate    *time.Time   `json:"production_date" db:"production_date"`
	ShelfLifeMonths   *int         `json:"shelf_life_months" db:"shelf_life_months"`
	StorageCondition  string       `json:"storage_condition" db:"storage_condition"`
	TotalQuantity     int          `json:"total_quantity" db:"total_quantity"`
	AvailableQuantity int          `json:"available_quantity" db:"available_quantity"`
	Status            int8         `json:"status" db:"status"`
	Remark            string       `json:"remark" db:"remark"`
	CreatedAt         time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time    `json:"updated_at" db:"updated_at"`
	BatchNo           string       `json:"batch_no" db:"batch_no"`
	HarvestDate       *time.Time   `json:"harvest_date" db:"harvest_date"`
	QualityLevel      string       `json:"quality_level" db:"quality_level"`
	VarietyName       string       `json:"variety_name" db:"variety_name"`
}

type ProductCreateRequest struct {
	ProductName      string     `json:"product_name" validate:"required"`
	BatchID          int64      `json:"batch_id" validate:"required,min=1"`
	Specification    string     `json:"specification"`
	PackageType      string     `json:"package_type"`
	NetWeight        *float64   `json:"net_weight"`
	ProductionDate   *time.Time `json:"production_date"`
	ShelfLifeMonths  *int       `json:"shelf_life_months"`
	StorageCondition string     `json:"storage_condition"`
	TotalQuantity    int        `json:"total_quantity" validate:"required,min=1"`
	Remark           string     `json:"remark"`
}

type ProductUpdateRequest struct {
	ProductName      string     `json:"product_name"`
	BatchID          *int64     `json:"batch_id"`
	Specification    *string    `json:"specification"`
	PackageType      *string    `json:"package_type"`
	NetWeight        *float64   `json:"net_weight"`
	ProductionDate   *time.Time `json:"production_date"`
	ShelfLifeMonths  *int       `json:"shelf_life_months"`
	StorageCondition *string    `json:"storage_condition"`
	TotalQuantity    *int       `json:"total_quantity"`
	Status           *int8      `json:"status"`
	Remark           *string    `json:"remark"`
}
