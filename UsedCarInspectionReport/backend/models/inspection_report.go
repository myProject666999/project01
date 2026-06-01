package models

import (
	"time"
)

type InspectionReport struct {
	ID            uint64     `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	ReportNo      string     `gorm:"type:varchar(32);not null;unique;column:report_no;index:idx_report_no" json:"reportNo"`
	VehicleID     uint64     `gorm:"type:bigint unsigned;not null;column:vehicle_id;index:idx_vehicle_id" json:"vehicleId"`
	InspectorID   uint64     `gorm:"type:bigint unsigned;not null;column:inspector_id;index:idx_inspector_id" json:"inspectorId"`
	Status        string     `gorm:"type:enum('draft','submitted','expired');not null;default:'draft';column:status" json:"status"`
	TotalScore    float64    `gorm:"type:decimal(5,2);column:total_score" json:"totalScore"`
	Level         string     `gorm:"type:varchar(10);column:level" json:"level"`
	InspectionDate string    `gorm:"type:date;column:inspection_date" json:"inspectionDate"`
	Mileage       int        `gorm:"type:int;column:mileage" json:"mileage"`
	Remark        string     `gorm:"type:text;column:remark" json:"remark"`
	ShareToken    string     `gorm:"type:varchar(64);unique;column:share_token;index:idx_share_token" json:"shareToken"`
	ShareExpireAt *time.Time `gorm:"type:timestamp;column:share_expire_at" json:"shareExpireAt"`
	CreatedAt     time.Time  `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP;column:created_at" json:"createdAt"`
	UpdatedAt     time.Time  `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;column:updated_at" json:"updatedAt"`

	Vehicle       *Vehicle           `gorm:"foreignKey:VehicleID" json:"vehicle,omitempty"`
	Inspector     *User              `gorm:"foreignKey:InspectorID" json:"inspector,omitempty"`
	CategoryScores []CategoryScore   `gorm:"foreignKey:ReportID" json:"categoryScores,omitempty"`
	Results       []InspectionResult `gorm:"foreignKey:ReportID" json:"results,omitempty"`
}

func (InspectionReport) TableName() string {
	return "inspection_reports"
}
