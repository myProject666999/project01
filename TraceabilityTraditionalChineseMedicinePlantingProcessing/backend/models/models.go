package models

import (
	"time"
)

type Product struct {
	ID               uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductCode      string         `gorm:"type:varchar(32);unique;not null;index" json:"product_code"`
	ProductName      string         `gorm:"type:varchar(100);not null" json:"product_name"`
	BatchID          uint64         `gorm:"type:bigint;not null;index" json:"batch_id"`
	Specification    string         `gorm:"type:varchar(50)" json:"specification"`
	PackageType      string         `gorm:"type:varchar(50)" json:"package_type"`
	NetWeight        *float64       `gorm:"type:decimal(8,2)" json:"net_weight"`
	ProductionDate   *time.Time     `gorm:"type:date" json:"production_date"`
	ShelfLifeMonths  *int           `gorm:"type:int" json:"shelf_life_months"`
	StorageCondition string         `gorm:"type:varchar(200)" json:"storage_condition"`
	TotalQuantity    int            `gorm:"type:int;not null" json:"total_quantity"`
	AvailableQuantity int           `gorm:"type:int;default:0" json:"available_quantity"`
	Status           int8           `gorm:"type:tinyint;default:1;index" json:"status"`
	Remark           string         `gorm:"type:text" json:"remark"`
	CreatedAt        time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	Batch            *HarvestBatch  `gorm:"foreignKey:BatchID" json:"batch,omitempty"`
}

type QRCode struct {
	ID          uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	QRCode      string         `gorm:"type:varchar(64);unique;not null;uniqueIndex" json:"qr_code"`
	ProductID   uint64         `gorm:"type:bigint;not null;index" json:"product_id"`
	BatchID     uint64         `gorm:"type:bigint;not null;index" json:"batch_id"`
	ScanCount   int            `gorm:"type:int;default:0" json:"scan_count"`
	LastScanAt  *time.Time     `gorm:"type:datetime" json:"last_scan_at"`
	Status      int8           `gorm:"type:tinyint;default:1;index" json:"status"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	Product     *Product       `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Batch       *HarvestBatch  `gorm:"foreignKey:BatchID" json:"batch,omitempty"`
}

type OutboundRecord struct {
	ID                uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	OutboundNo        string         `gorm:"type:varchar(32);unique;not null;index" json:"outbound_no"`
	ProductID         uint64         `gorm:"type:bigint;not null;index" json:"product_id"`
	BatchID           uint64         `gorm:"type:bigint;not null;index" json:"batch_id"`
	Quantity          int            `gorm:"type:int;not null" json:"quantity"`
	OutboundDate      time.Time      `gorm:"type:datetime;default:CURRENT_TIMESTAMP;index" json:"outbound_date"`
	Receiver          string         `gorm:"type:varchar(100)" json:"receiver"`
	OperatorID        uint64         `gorm:"type:bigint;not null;index" json:"operator_id"`
	SafeCheckPassed   int8           `gorm:"type:tinyint;not null;index" json:"safe_check_passed"`
	SafeCheckDetail   string         `gorm:"type:text" json:"safe_check_detail"`
	Remark            string         `gorm:"type:text" json:"remark"`
	CreatedAt         time.Time      `gorm:"autoCreateTime" json:"created_at"`
	Product           *Product       `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Batch             *HarvestBatch  `gorm:"foreignKey:BatchID" json:"batch,omitempty"`
	Operator          *Operator      `gorm:"foreignKey:OperatorID" json:"operator,omitempty"`
}

type ApiAccessLog struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	APIPath       string    `gorm:"type:varchar(200);not null;index" json:"api_path"`
	IPAddress     string    `gorm:"type:varchar(45);not null;index" json:"ip_address"`
	UserAgent     string    `gorm:"type:varchar(500)" json:"user_agent"`
	RequestMethod string    `gorm:"type:varchar(10)" json:"request_method"`
	ResponseStatus *int      `gorm:"type:int" json:"response_status"`
	IsBlocked     int8      `gorm:"type:tinyint;default:0;index" json:"is_blocked"`
	BlockReason   string    `gorm:"type:varchar(200)" json:"block_reason"`
	RequestTime   time.Time `gorm:"type:datetime;default:CURRENT_TIMESTAMP;index" json:"request_time"`
}

type IPBlacklist struct {
	ID        uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	IPAddress string     `gorm:"type:varchar(45);unique;not null;index" json:"ip_address"`
	Reason    string     `gorm:"type:varchar(200)" json:"reason"`
	BlockedAt time.Time  `gorm:"type:datetime;default:CURRENT_TIMESTAMP" json:"blocked_at"`
	ExpireAt  *time.Time `gorm:"type:datetime;index" json:"expire_at"`
}
