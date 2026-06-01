package model

import "time"

type YardZone struct {
	ID         int64      `json:"id"`
	ZoneCode   string     `json:"zone_code"`
	ZoneName   string     `json:"zone_name"`
	ZoneType   string     `json:"zone_type"`
	IMOClass   string     `json:"imo_class,omitempty"`
	MinSpacing int        `json:"min_spacing"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

type YardSlot struct {
	ID    int64  `json:"id"`
	ZoneID int64 `json:"zone_id"`
	Bay   int    `json:"bay"`
	Row   int    `json:"row"`
	Tier  int    `json:"tier"`
	Status string `json:"status"`
	ContainerNo string `json:"container_no,omitempty"`
	Container *Container `json:"container,omitempty"`
}

type Container struct {
	ID             int64      `json:"id"`
	ContainerNo    string     `json:"container_no"`
	OwnerCode      string     `json:"owner_code"`
	SizeType       string     `json:"size_type"`
	WeightKg       int        `json:"weight_kg"`
	IsDangerous    bool       `json:"is_dangerous"`
	IMOClass       string     `json:"imo_class,omitempty"`
	ArrivalTime    time.Time  `json:"arrival_time"`
	DepartureTime  *time.Time `json:"departure_time,omitempty"`
	SlotID         *int64     `json:"slot_id,omitempty"`
	Status         string     `json:"status"`
	ReshuffleCount int        `json:"reshuffle_count"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type Appointment struct {
	ID           int64      `json:"id"`
	ContainerID  int64      `json:"container_id"`
	TruckPlate   string     `json:"truck_plate"`
	DriverName   string     `json:"driver_name"`
	AppointTime  time.Time  `json:"appoint_time"`
	AppointEnd   time.Time  `json:"appoint_end"`
	Status       string     `json:"status"`
	ContainerNo  string     `json:"container_no,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type SlotLock struct {
	ID       int64     `json:"id"`
	SlotID   int64     `json:"slot_id"`
	Locker   string    `json:"locker"`
	LockType string    `json:"lock_type"`
	LockedAt time.Time `json:"locked_at"`
	ExpireAt time.Time `json:"expire_at"`
}

type StackRecommendation struct {
	ZoneID int64 `json:"zone_id"`
	Bay    int   `json:"bay"`
	Row    int   `json:"row"`
	Tier   int   `json:"tier"`
	Reason string `json:"reason"`
}

type BayOverview struct {
	ZoneID   int64                `json:"zone_id"`
	ZoneCode string               `json:"zone_code"`
	ZoneType string               `json:"zone_type"`
	Bay      int                  `json:"bay"`
	Rows     int                  `json:"rows"`
	Tiers    int                  `json:"tiers"`
	Slots    [][]*YardSlot        `json:"slots"`
	Stats    BayStats             `json:"stats"`
}

type BayStats struct {
	Total       int `json:"total"`
	Occupied    int `json:"occupied"`
	Empty       int `json:"empty"`
	Utilization float64 `json:"utilization"`
}

type ContainerInRequest struct {
	ContainerNo   string `json:"container_no"`
	OwnerCode     string `json:"owner_code"`
	SizeType      string `json:"size_type"`
	WeightKg      int    `json:"weight_kg"`
	IsDangerous   bool   `json:"is_dangerous"`
	IMOClass      string `json:"imo_class,omitempty"`
	ArrivalTime   string `json:"arrival_time"`
	DepartureTime string `json:"departure_time,omitempty"`
}

type ContainerOutRequest struct {
	ContainerNo string `json:"container_no"`
}

type AppointmentRequest struct {
	ContainerNo  string `json:"container_no"`
	TruckPlate   string `json:"truck_plate"`
	DriverName   string `json:"driver_name"`
	AppointTime  string `json:"appoint_time"`
	AppointEnd   string `json:"appoint_end"`
}
