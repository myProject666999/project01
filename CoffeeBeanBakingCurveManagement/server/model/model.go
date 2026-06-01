package model

import "time"

type GreenBean struct {
	ID               int64      `json:"id" gorm:"primaryKey;autoIncrement"`
	Origin           string     `json:"origin" gorm:"not null;size:255"`
	ProcessingMethod string     `json:"processing_method" gorm:"not null;size:50"`
	BatchNumber      string     `json:"batch_number" gorm:"not null;size:100"`
	MoistureRate     *float64   `json:"moisture_rate" gorm:"type:decimal(5,2)"`
	ScreenSize       string     `json:"screen_size" gorm:"size:50"`
	Density          *float64   `json:"density" gorm:"type:decimal(7,2)"`
	Weight           *float64   `json:"weight" gorm:"type:decimal(10,2)"`
	Notes            string     `json:"notes" gorm:"type:text"`
	CreatedAt        time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt        time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
}

func (GreenBean) TableName() string {
	return "green_beans"
}

type RoastingRecord struct {
	ID                  int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	GreenBeanID         int64     `json:"green_bean_id" gorm:"not null"`
	RoastingDate        time.Time `json:"roasting_date" gorm:"not null"`
	BeanTempStart       *float64  `json:"bean_temp_start" gorm:"type:decimal(5,1)"`
	BeanTempEnd         *float64  `json:"bean_temp_end" gorm:"type:decimal(5,1)"`
	AirTempStart        *float64  `json:"air_temp_start" gorm:"type:decimal(5,1)"`
	AirTempEnd          *float64  `json:"air_temp_end" gorm:"type:decimal(5,1)"`
	TurningYellowTime   *float64  `json:"turning_yellow_time" gorm:"type:decimal(7,1)"`
	FirstCrackStartTime *float64  `json:"first_crack_start_time" gorm:"type:decimal(7,1)"`
	FirstCrackEndTime   *float64  `json:"first_crack_end_time" gorm:"type:decimal(7,1)"`
	DropTime            *float64  `json:"drop_time" gorm:"type:decimal(7,1)"`
	DevelopmentTime     *float64  `json:"development_time" gorm:"type:decimal(7,1)"`
	TotalTime           *float64  `json:"total_time" gorm:"type:decimal(7,1)"`
	RoastLevel          string    `json:"roast_level" gorm:"size:20"`
	ChargeWeight        *float64  `json:"charge_weight" gorm:"type:decimal(10,2)"`
	DropWeight          *float64  `json:"drop_weight" gorm:"type:decimal(10,2)"`
	Notes               string    `json:"notes" gorm:"type:text"`
	CreatedAt           time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt           time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	GreenBean   *GreenBean     `json:"green_bean,omitempty" gorm:"foreignKey:GreenBeanID"`
	CurvePoints []CurvePoint   `json:"curve_points,omitempty" gorm:"foreignKey:RoastingRecordID"`
	CuppingScore *CuppingScore `json:"cupping_score,omitempty" gorm:"foreignKey:RoastingRecordID"`
}

func (RoastingRecord) TableName() string {
	return "roasting_records"
}

type CurvePoint struct {
	ID               int64   `json:"id" gorm:"primaryKey;autoIncrement"`
	RoastingRecordID int64   `json:"roasting_record_id" gorm:"not null;index:idx_curve_record_type"`
	CurveType        string  `json:"curve_type" gorm:"not null;size:20;index:idx_curve_record_type"`
	ElapsedSeconds   float64 `json:"elapsed_seconds" gorm:"not null;type:decimal(7,1)"`
	Temperature      float64 `json:"temperature" gorm:"not null;type:decimal(5,1)"`
}

func (CurvePoint) TableName() string {
	return "curve_points"
}

type CuppingScore struct {
	ID               int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	RoastingRecordID int64     `json:"roasting_record_id" gorm:"not null"`
	CuppingDate      time.Time `json:"cupping_date" gorm:"not null"`
	RestHours        *int      `json:"rest_hours"`
	DryAroma         float64   `json:"dry_aroma" gorm:"not null;type:decimal(3,1);default:0"`
	WetAroma         float64   `json:"wet_aroma" gorm:"not null;type:decimal(3,1);default:0"`
	Flavor           float64   `json:"flavor" gorm:"not null;type:decimal(3,1);default:0"`
	Aftertaste       float64   `json:"aftertaste" gorm:"not null;type:decimal(3,1);default:0"`
	Acidity          float64   `json:"acidity" gorm:"not null;type:decimal(3,1);default:0"`
	Body             float64   `json:"body" gorm:"not null;type:decimal(3,1);default:0"`
	Uniformity       float64   `json:"uniformity" gorm:"not null;type:decimal(3,1);default:0"`
	Balance          float64   `json:"balance" gorm:"not null;type:decimal(3,1);default:0"`
	Cleanness        float64   `json:"cleanness" gorm:"not null;type:decimal(3,1);default:0"`
	Sweetness        float64   `json:"sweetness" gorm:"not null;type:decimal(3,1);default:0"`
	Overall          float64   `json:"overall" gorm:"not null;type:decimal(3,1);default:0"`
	TotalScore       float64   `json:"total_score" gorm:"not null;type:decimal(4,1);default:0"`
	Notes            string    `json:"notes" gorm:"type:text"`
	CreatedAt        time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt        time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (CuppingScore) TableName() string {
	return "cupping_scores"
}
