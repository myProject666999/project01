package model

import (
	"time"
)

type Warehouse struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name"`
	Code      string    `gorm:"type:varchar(50);unique;not null" json:"code"`
	Country   string    `gorm:"type:varchar(50);not null" json:"country"`
	City      string    `gorm:"type:varchar(100);not null" json:"city"`
	Address   string    `gorm:"type:text;not null" json:"address"`
	Phone     string    `gorm:"type:varchar(30)" json:"phone"`
	Status    int8      `gorm:"type:tinyint;default:1" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Warehouse) TableName() string {
	return "warehouses"
}

type Customer struct {
	ID         uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	CustomerNo string     `gorm:"type:varchar(50);unique;not null" json:"customer_no"`
	Name       string     `gorm:"type:varchar(100);not null" json:"name"`
	Phone      string     `gorm:"type:varchar(30);not null" json:"phone"`
	Email      string     `gorm:"type:varchar(100)" json:"email"`
	Country    string     `gorm:"type:varchar(50);not null" json:"country"`
	City       string     `gorm:"type:varchar(100);not null" json:"city"`
	State      string     `gorm:"type:varchar(100)" json:"state"`
	ZipCode    string     `gorm:"type:varchar(30)" json:"zip_code"`
	Address    string     `gorm:"type:text;not null" json:"address"`
	Latitude   *float64   `gorm:"type:decimal(10,7)" json:"latitude,omitempty"`
	Longitude  *float64   `gorm:"type:decimal(10,7)" json:"longitude,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

func (Customer) TableName() string {
	return "customers"
}

type Batch struct {
	ID            uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	BatchNo       string     `gorm:"type:varchar(50);unique;not null" json:"batch_no"`
	WarehouseID   uint64     `gorm:"not null" json:"warehouse_id"`
	TotalPackages int        `gorm:"type:int;default:0" json:"total_packages"`
	Status        int8       `gorm:"type:tinyint;default:1" json:"status"`
	ArrivedAt     *time.Time `json:"arrived_at,omitempty"`
	Remark        string     `gorm:"type:text" json:"remark"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	Warehouse     *Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
}

func (Batch) TableName() string {
	return "batches"
}

type Package struct {
	ID               uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	PackageNo        string         `gorm:"type:varchar(50);unique;not null" json:"package_no"`
	BatchID          uint64         `gorm:"not null" json:"batch_id"`
	CustomerID       uint64         `gorm:"not null" json:"customer_id"`
	WarehouseID      uint64         `gorm:"not null" json:"warehouse_id"`
	Weight           *float64       `gorm:"type:decimal(10,2)" json:"weight,omitempty"`
	Length           *float64       `gorm:"type:decimal(10,2)" json:"length,omitempty"`
	Width            *float64       `gorm:"type:decimal(10,2)" json:"width,omitempty"`
	Height           *float64       `gorm:"type:decimal(10,2)" json:"height,omitempty"`
	GoodsDescription string         `gorm:"type:text" json:"goods_description"`
	DeclaredValue    *float64       `gorm:"type:decimal(12,2)" json:"declared_value,omitempty"`
	Currency         string         `gorm:"type:varchar(10);default:'USD'" json:"currency"`
	Status           int8           `gorm:"type:tinyint;default:1" json:"status"`
	Language         string         `gorm:"type:varchar(10);default:'en'" json:"language"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Batch            *Batch         `gorm:"foreignKey:BatchID" json:"batch,omitempty"`
	Customer         *Customer      `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	Warehouse        *Warehouse     `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	Label            *Label         `gorm:"foreignKey:PackageID" json:"label,omitempty"`
}

func (Package) TableName() string {
	return "packages"
}

type Label struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	PackageID  uint64    `gorm:"not null" json:"package_id"`
	LabelNo    string    `gorm:"type:varchar(100);unique;not null" json:"label_no"`
	Barcode    string    `gorm:"type:varchar(100);not null" json:"barcode"`
	BarcodeType string   `gorm:"type:varchar(20);default:'CODE128'" json:"barcode_type"`
	Language   string    `gorm:"type:varchar(10);default:'en'" json:"language"`
	LabelData  string    `gorm:"type:json" json:"label_data"`
	LabelURL   string    `gorm:"type:varchar(255)" json:"label_url"`
	Printed    int8      `gorm:"type:tinyint;default:0" json:"printed"`
	PrintedAt  *time.Time `json:"printed_at,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (Label) TableName() string {
	return "labels"
}

type Courier struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CourierNo       string    `gorm:"type:varchar(50);unique;not null" json:"courier_no"`
	Name            string    `gorm:"type:varchar(100);not null" json:"name"`
	Phone           string    `gorm:"type:varchar(30);unique;not null" json:"phone"`
	Email           string    `gorm:"type:varchar(100)" json:"email"`
	AvatarURL       string    `gorm:"type:varchar(255)" json:"avatar_url"`
	VehicleType     string    `gorm:"type:varchar(50)" json:"vehicle_type"`
	VehicleNo       string    `gorm:"type:varchar(50)" json:"vehicle_no"`
	Status          int8      `gorm:"type:tinyint;default:1" json:"status"`
	CurrentArea     string    `gorm:"type:varchar(100)" json:"current_area"`
	Rating          float64   `gorm:"type:decimal(3,2);default:5.00" json:"rating"`
	TotalDeliveries int       `gorm:"type:int;default:0" json:"total_deliveries"`
	PasswordHash    string    `gorm:"type:varchar(255);not null" json:"-"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (Courier) TableName() string {
	return "couriers"
}

type Route struct {
	ID                 uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	RouteNo            string         `gorm:"type:varchar(50);unique;not null" json:"route_no"`
	CourierID          *uint64        `json:"courier_id,omitempty"`
	WarehouseID        uint64         `gorm:"not null" json:"warehouse_id"`
	Name               string         `gorm:"type:varchar(100)" json:"name"`
	Area               string         `gorm:"type:varchar(100)" json:"area"`
	TotalTasks         int            `gorm:"type:int;default:0" json:"total_tasks"`
	CompletedTasks     int            `gorm:"type:int;default:0" json:"completed_tasks"`
	Status             int8           `gorm:"type:tinyint;default:1" json:"status"`
	EstimatedStartTime *time.Time     `json:"estimated_start_time,omitempty"`
	EstimatedEndTime   *time.Time     `json:"estimated_end_time,omitempty"`
	ActualStartTime    *time.Time     `json:"actual_start_time,omitempty"`
	ActualEndTime      *time.Time     `json:"actual_end_time,omitempty"`
	OptimizedPath      string         `gorm:"type:json" json:"optimized_path"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	Courier            *Courier       `gorm:"foreignKey:CourierID" json:"courier,omitempty"`
	Warehouse          *Warehouse     `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	Tasks              []DeliveryTask `gorm:"foreignKey:RouteID" json:"tasks,omitempty"`
}

func (Route) TableName() string {
	return "routes"
}

type DeliveryTask struct {
	ID                   uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskNo               string         `gorm:"type:varchar(50);unique;not null" json:"task_no"`
	PackageID            uint64         `gorm:"not null" json:"package_id"`
	RouteID              *uint64        `json:"route_id,omitempty"`
	CourierID            *uint64        `json:"courier_id,omitempty"`
	CustomerID           uint64         `gorm:"not null" json:"customer_id"`
	Sequence             *int           `json:"sequence,omitempty"`
	Status               int8           `gorm:"type:tinyint;default:1" json:"status"`
	Priority             int8           `gorm:"type:tinyint;default:3" json:"priority"`
	EstimatedDeliveryTime *time.Time    `json:"estimated_delivery_time,omitempty"`
	ActualDeliveryTime   *time.Time     `json:"actual_delivery_time,omitempty"`
	AttemptCount         int            `gorm:"type:int;default:0" json:"attempt_count"`
	LastAttemptTime      *time.Time     `json:"last_attempt_time,omitempty"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	Package              *Package       `gorm:"foreignKey:PackageID" json:"package,omitempty"`
	Route                *Route         `gorm:"foreignKey:RouteID" json:"route,omitempty"`
	Courier              *Courier       `gorm:"foreignKey:CourierID" json:"courier,omitempty"`
	Customer             *Customer      `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
}

func (DeliveryTask) TableName() string {
	return "delivery_tasks"
}

type DeliveryProof struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID         uint64    `gorm:"not null" json:"task_id"`
	PackageID      uint64    `gorm:"not null" json:"package_id"`
	CourierID      uint64    `gorm:"not null" json:"courier_id"`
	PhotoURL       string    `gorm:"type:varchar(255)" json:"photo_url"`
	SignatureURL   string    `gorm:"type:varchar(255)" json:"signature_url"`
	SignerName     string    `gorm:"type:varchar(100)" json:"signer_name"`
	SignerRelation string    `gorm:"type:varchar(50)" json:"signer_relation"`
	DeliveryNote   string    `gorm:"type:text" json:"delivery_note"`
	Latitude       *float64  `gorm:"type:decimal(10,7)" json:"latitude,omitempty"`
	Longitude      *float64  `gorm:"type:decimal(10,7)" json:"longitude,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

func (DeliveryProof) TableName() string {
	return "delivery_proofs"
}

type DeliveryException struct {
	ID              uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID          uint64     `gorm:"not null" json:"task_id"`
	PackageID       uint64     `gorm:"not null" json:"package_id"`
	CourierID       uint64     `gorm:"not null" json:"courier_id"`
	ExceptionType   string     `gorm:"type:varchar(30);not null" json:"exception_type"`
	ExceptionCode   string     `gorm:"type:varchar(20)" json:"exception_code"`
	Description     string     `gorm:"type:text" json:"description"`
	PhotoURL        string     `gorm:"type:varchar(255)" json:"photo_url"`
	Status          int8       `gorm:"type:tinyint;default:1" json:"status"`
	HandlingType    string     `gorm:"type:varchar(30)" json:"handling_type"`
	HandlingResult  string     `gorm:"type:text" json:"handling_result"`
	HandledBy       *uint64    `json:"handled_by,omitempty"`
	HandledAt       *time.Time `json:"handled_at,omitempty"`
	NextAttemptTime *time.Time `json:"next_attempt_time,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func (DeliveryException) TableName() string {
	return "delivery_exceptions"
}

type User struct {
	ID          uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Username    string     `gorm:"type:varchar(50);unique;not null" json:"username"`
	PasswordHash string    `gorm:"type:varchar(255);not null" json:"-"`
	Name        string     `gorm:"type:varchar(100);not null" json:"name"`
	Email       string     `gorm:"type:varchar(100)" json:"email"`
	Phone       string     `gorm:"type:varchar(30)" json:"phone"`
	Role        string     `gorm:"type:varchar(20);not null" json:"role"`
	WarehouseID *uint64    `json:"warehouse_id,omitempty"`
	Status      int8       `gorm:"type:tinyint;default:1" json:"status"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
