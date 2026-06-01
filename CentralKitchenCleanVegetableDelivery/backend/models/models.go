package models

import (
	"time"
)

type Customer struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	Type          string    `gorm:"size:50;not null" json:"type"`
	Address       string    `gorm:"size:255;not null" json:"address"`
	Longitude     float64   `gorm:"decimal(10,6)" json:"longitude"`
	Latitude      float64   `gorm:"decimal(10,6)" json:"latitude"`
	ContactPerson string    `gorm:"size:50" json:"contact_person"`
	Phone         string    `gorm:"size:20" json:"phone"`
	Status        int       `gorm:"default:1" json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Product struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	Category      string    `gorm:"size:50" json:"category"`
	Unit          string    `gorm:"size:20;not null" json:"unit"`
	Price         float64   `gorm:"decimal(10,2)" json:"price"`
	ProcessingTime int       `json:"processing_time"`
	EquipmentType string    `gorm:"size:50" json:"equipment_type"`
	Status        int       `gorm:"default:1" json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Equipment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Type      string    `gorm:"size:50;not null" json:"type"`
	Capacity  float64   `gorm:"decimal(10,2)" json:"capacity"`
	Status    int       `gorm:"default:1" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Order struct {
	ID           uint        `gorm:"primaryKey" json:"id"`
	OrderNo      string      `gorm:"size:50;unique;not null" json:"order_no"`
	CustomerID   uint        `gorm:"not null" json:"customer_id"`
	DeliveryDate time.Time   `json:"delivery_date"`
	TotalAmount  float64     `gorm:"decimal(12,2);default:0" json:"total_amount"`
	Status       int         `gorm:"default:0" json:"status"`
	Remark       string      `gorm:"type:text" json:"remark"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
	Customer     Customer    `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	OrderItems   []OrderItem `gorm:"foreignKey:OrderID" json:"order_items,omitempty"`
}

type OrderItem struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	OrderID    uint      `gorm:"not null" json:"order_id"`
	ProductID  uint      `gorm:"not null" json:"product_id"`
	Quantity   float64   `gorm:"decimal(10,2);not null" json:"quantity"`
	UnitPrice  float64   `gorm:"decimal(10,2)" json:"unit_price"`
	Subtotal   float64   `gorm:"decimal(12,2)" json:"subtotal"`
	CreatedAt  time.Time `json:"created_at"`
	Product    Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

type ProcessingTask struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	TaskNo        string      `gorm:"size:50;unique;not null" json:"task_no"`
	ProductID     uint        `gorm:"not null" json:"product_id"`
	TotalQuantity float64     `gorm:"decimal(10,2);not null" json:"total_quantity"`
	EquipmentID  *uint       `json:"equipment_id"`
	PlanStartTime *time.Time `json:"plan_start_time"`
	PlanEndTime   *time.Time `json:"plan_end_time"`
	ActualStartTime *time.Time `json:"actual_start_time"`
	ActualEndTime   *time.Time `json:"actual_end_time"`
	Status        int         `gorm:"default:0" json:"status"`
	Worker        string      `gorm:"size:50" json:"worker"`
	Remark        string      `gorm:"type:text" json:"remark"`
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
	Product       Product     `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Equipment     *Equipment  `gorm:"foreignKey:EquipmentID" json:"equipment,omitempty"`
}

type Vehicle struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	PlateNumber string    `gorm:"size:20;unique;not null" json:"plate_number"`
	DriverName  string    `gorm:"size:50" json:"driver_name"`
	DriverPhone string    `gorm:"size:20" json:"driver_phone"`
	Capacity    float64   `gorm:"decimal(10,2)" json:"capacity"`
	Status      int       `gorm:"default:1" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Delivery struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	DeliveryNo      string    `gorm:"size:50;unique;not null" json:"delivery_no"`
	VehicleID       uint        `gorm:"not null" json:"vehicle_id"`
	DeliveryDate    time.Time   `json:"delivery_date"`
	PlanDepartTime  *time.Time `json:"plan_depart_time"`
	ActualDepartTime *time.Time `json:"actual_depart_time"`
	ActualArriveTime *time.Time `json:"actual_arrive_time"`
	Status          int         `gorm:"default:0" json:"status"`
	Route           string      `gorm:"type:text" json:"route"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
	Vehicle         Vehicle     `gorm:"foreignKey:VehicleID" json:"vehicle,omitempty"`
}

type DeliveryItem struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	DeliveryID         uint        `gorm:"not null" json:"delivery_id"`
	OrderID            uint        `gorm:"not null" json:"order_id"`
	CustomerID         uint        `gorm:"not null" json:"customer_id"`
	Sequence           *int       `json:"sequence"`
	SignTime           *time.Time `json:"sign_time"`
	SignPerson         string     `gorm:"size:50" json:"sign_person"`
	TemperatureConfirmed int        `gorm:"default:0" json:"temperature_confirmed"`
	CreatedAt          time.Time  `json:"created_at"`
	Order              Order      `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	Customer           Customer   `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
}

type TemperatureRecord struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	DeliveryID uint        `gorm:"not null" json:"delivery_id"`
	Temperature float64     `gorm:"decimal(5,2);not null" json:"temperature"`
	RecordTime  time.Time   `gorm:"not null" json:"record_time"`
	CreatedAt   time.Time   `json:"created_at"`
}

type WasteRecord struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ProductID uint        `gorm:"not null" json:"product_id"`
	Quantity  float64     `gorm:"decimal(10,2);not null" json:"quantity"`
	Reason    string      `gorm:"size:255;not null" json:"reason"`
	RecordDate time.Time   `json:"record_date"`
	Handler    string      `gorm:"size:50" json:"handler"`
	Remark     string      `gorm:"type:text" json:"remark"`
	CreatedAt  time.Time   `json:"created_at"`
	Product    Product     `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}
