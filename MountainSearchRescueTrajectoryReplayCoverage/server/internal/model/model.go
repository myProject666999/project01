package model

import (
	"encoding/json"
	"time"
)

type Mission struct {
	ID         int             `json:"id" db:"id"`
	Name       string          `json:"name" db:"name"`
	Status     string          `json:"status" db:"status"`
	SearchArea json.RawMessage `json:"searchArea" db:"search_area"`
	CreatedAt  time.Time       `json:"createdAt" db:"created_at"`
	UpdatedAt  time.Time       `json:"updatedAt" db:"updated_at"`
}

type SubArea struct {
	ID        int             `json:"id" db:"id"`
	MissionID int             `json:"missionId" db:"mission_id"`
	Name      string          `json:"name" db:"name"`
	Boundary  json.RawMessage `json:"boundary" db:"boundary"`
	TeamID    *int            `json:"teamId" db:"team_id"`
	Status    string          `json:"status" db:"status"`
	Color     string          `json:"color" db:"color"`
	CreatedAt time.Time       `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time       `json:"updatedAt" db:"updated_at"`
}

type RescueTeam struct {
	ID        int       `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	LeaderID  *int      `json:"leaderId" db:"leader_id"`
	Color     string    `json:"color" db:"color"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

type Member struct {
	ID        int       `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	TeamID    int       `json:"teamId" db:"team_id"`
	Phone     string    `json:"phone" db:"phone"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

type GPSPoint struct {
	ID        int64      `json:"id" db:"id"`
	MemberID  int        `json:"memberId" db:"member_id"`
	MissionID int        `json:"missionId" db:"mission_id"`
	Lat       float64    `json:"lat" db:"lat"`
	Lng       float64    `json:"lng" db:"lng"`
	Altitude  *float64   `json:"altitude" db:"altitude"`
	Speed     *float64   `json:"speed" db:"speed"`
	Timestamp time.Time  `json:"timestamp" db:"timestamp"`
	IsCached  bool       `json:"isCached" db:"is_cached"`
	CreatedAt time.Time  `json:"createdAt" db:"created_at"`
}

type Discovery struct {
	ID          int        `json:"id" db:"id"`
	MissionID   int        `json:"missionId" db:"mission_id"`
	MemberID    int        `json:"memberId" db:"member_id"`
	Type        string     `json:"type" db:"type"`
	Description string     `json:"description" db:"description"`
	Lat         float64    `json:"lat" db:"lat"`
	Lng         float64    `json:"lng" db:"lng"`
	ImageURL    *string    `json:"imageUrl" db:"image_url"`
	Timestamp   time.Time  `json:"timestamp" db:"timestamp"`
	CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
}

type CoverageResult struct {
	MissionID     int               `json:"missionId"`
	TotalArea     float64           `json:"totalArea"`
	CoveredArea   float64           `json:"coveredArea"`
	CoverageRatio float64           `json:"coverageRatio"`
	SubAreas      []SubAreaCoverage `json:"subAreas"`
}

type SubAreaCoverage struct {
	SubAreaID     int     `json:"subAreaId"`
	Name          string  `json:"name"`
	TotalArea     float64 `json:"totalArea"`
	CoveredArea   float64 `json:"coveredArea"`
	CoverageRatio float64 `json:"coverageRatio"`
	Color         string  `json:"color"`
}

type BatchGPSRequest struct {
	Points []GPSPoint `json:"points"`
}

type PositionMessage struct {
	Type      string    `json:"type"`
	MemberID  int       `json:"memberId"`
	Lat       float64   `json:"lat"`
	Lng       float64   `json:"lng"`
	Timestamp time.Time `json:"timestamp"`
}

type HeatmapPoint struct {
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Intensity float64 `json:"intensity"`
}

type HeatmapResponse struct {
	MissionID int             `json:"missionId"`
	Points    []HeatmapPoint  `json:"points"`
}
