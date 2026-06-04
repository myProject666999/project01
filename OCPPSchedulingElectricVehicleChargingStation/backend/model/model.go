package model

import (
	"time"
)

type User struct {
	ID        int64     `json:"id"`
	Phone     string    `json:"phone"`
	Password  string    `json:"-"`
	Nickname  string    `json:"nickname"`
	Balance   float64   `json:"balance"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Station struct {
	ID             int64   `json:"id"`
	Name           string  `json:"name"`
	Address        string  `json:"address"`
	Latitude       float64 `json:"latitude"`
	Longitude      float64 `json:"longitude"`
	AvailableCount int     `json:"available_count"`
	TotalCount     int     `json:"total_count"`
	Status         int8    `json:"status"`
}

type ChargePoint struct {
	ID             int64     `json:"id"`
	StationID      int64     `json:"station_id"`
	CPSerial       string    `json:"cp_serial"`
	Name           string    `json:"name"`
	Status         string    `json:"status"`
	ErrorCode      string    `json:"error_code"`
	PowerKw        float64   `json:"power_kw"`
	PricePerKwh    float64   `json:"price_per_kwh"`
	LastHeartbeatAt *time.Time `json:"last_heartbeat_at"`
	IsOnline       int8      `json:"is_online"`
}

type Connector struct {
	ID            int64     `json:"id"`
	ChargePointID int64     `json:"charge_point_id"`
	ConnectorID   int       `json:"connector_id"`
	Status        string    `json:"status"`
	QRCode        string    `json:"qr_code"`
}

type Reservation struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	ConnectorID int64     `json:"connector_id"`
	Status      string    `json:"status"`
	ExpiredAt   time.Time `json:"expired_at"`
}

type Transaction struct {
	ID            int64      `json:"id"`
	TransactionID string     `json:"transaction_id"`
	UserID        int64      `json:"user_id"`
	ConnectorID   int64      `json:"connector_id"`
	ChargePointID int64      `json:"charge_point_id"`
	IDTag         string     `json:"id_tag"`
	StartTime     *time.Time `json:"start_time"`
	StopTime      *time.Time `json:"stop_time"`
	StartMeter    float64    `json:"start_meter"`
	StopMeter     float64    `json:"stop_meter"`
	ConsumedKwh   float64    `json:"consumed_kwh"`
	Amount        float64    `json:"amount"`
	PricePerKwh   float64    `json:"price_per_kwh"`
	Status        string     `json:"status"`
	StopReason    string     `json:"stop_reason"`
}

type MeterValue struct {
	ID            int64     `json:"id"`
	TransactionID string    `json:"transaction_id"`
	ChargePointID int64     `json:"charge_point_id"`
	ConnectorIDVal int      `json:"connector_id_val"`
	Value         float64   `json:"value"`
	Measurand     string    `json:"measurand"`
	Unit          string    `json:"unit"`
	RecordedAt    time.Time `json:"recorded_at"`
}

type Payment struct {
	ID            int64      `json:"id"`
	UserID        int64      `json:"user_id"`
	TransactionID string     `json:"transaction_id"`
	Amount        float64    `json:"amount"`
	PayMethod     string     `json:"pay_method"`
	Status        string     `json:"status"`
	PaidAt        *time.Time `json:"paid_at"`
}

type ChargePointState struct {
	CPSerial    string `json:"cp_serial"`
	Status      string `json:"status"`
	IsOnline    bool   `json:"is_online"`
	ConnectorID int    `json:"connector_id"`
	ConnectorStatus string `json:"connector_status"`
	TransactionID string `json:"transaction_id"`
	UserID      int64  `json:"user_id"`
	CurrentMeter float64 `json:"current_meter"`
}
