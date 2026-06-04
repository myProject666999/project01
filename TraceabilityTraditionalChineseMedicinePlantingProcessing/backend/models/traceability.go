package models

import "time"

type TraceabilityResponse struct {
	Product    ProductInfo          `json:"product"`
	Batch      BatchInfo            `json:"batch"`
	Plot       PlotInfo             `json:"plot"`
	Variety    VarietyInfo          `json:"variety"`
	Farming    []FarmingRecordInfo  `json:"farming_records"`
	Processing []ProcessingRecordInfo `json:"processing_records"`
	SafetyCheck SafetyCheckInfo     `json:"safety_check"`
	ScanInfo   ScanInfo             `json:"scan_info"`
}

type ProductInfo struct {
	ID               int64      `json:"id"`
	ProductCode      string     `json:"product_code"`
	ProductName      string     `json:"product_name"`
	Specification    string     `json:"specification"`
	PackageType      string     `json:"package_type"`
	NetWeight        *float64   `json:"net_weight"`
	ProductionDate   *time.Time `json:"production_date"`
	ShelfLifeMonths  *int       `json:"shelf_life_months"`
	StorageCondition string     `json:"storage_condition"`
}

type BatchInfo struct {
	ID              int64      `json:"id"`
	BatchNo         string     `json:"batch_no"`
	HarvestDate     time.Time  `json:"harvest_date"`
	Quantity        float64    `json:"quantity"`
	QualityLevel    string     `json:"quality_level"`
	HarvestMethod   string     `json:"harvest_method"`
	WeatherCondition string    `json:"weather_condition"`
	OperatorName    string     `json:"operator_name"`
}

type PlotInfo struct {
	ID             int64    `json:"id"`
	PlotCode       string   `json:"plot_code"`
	Name           string   `json:"name"`
	FullAddress    string   `json:"full_address"`
	Longitude      float64  `json:"longitude"`
	Latitude       float64  `json:"latitude"`
	Altitude       *float64 `json:"altitude"`
	SoilType       string   `json:"soil_type"`
	SoilPh         *float64 `json:"soil_ph"`
	Area           *float64 `json:"area"`
	SeedlingSource string   `json:"seedling_source"`
	PlantingDate   *time.Time `json:"planting_date"`
	OperatorName   string   `json:"operator_name"`
}

type VarietyInfo struct {
	Code            string `json:"code"`
	Name            string `json:"name"`
	Alias           string `json:"alias"`
	ScientificName  string `json:"scientific_name"`
	Origin          string `json:"origin"`
	GrowthCycleDays *int   `json:"growth_cycle_days"`
	Description     string `json:"description"`
}

type FarmingRecordInfo struct {
	ID                int64      `json:"id"`
	OperationDate     time.Time  `json:"operation_date"`
	OperationType     string     `json:"operation_type"`
	OperationCategory string     `json:"operation_category"`
	OperatorName      string     `json:"operator_name"`
	FertilizerName    *string    `json:"fertilizer_name,omitempty"`
	FertilizerQty     *float64   `json:"fertilizer_quantity,omitempty"`
	PesticideName     *string    `json:"pesticide_name,omitempty"`
	PesticideQty      *float64   `json:"pesticide_quantity,omitempty"`
	SafeIntervalDays  *int       `json:"safe_interval_days,omitempty"`
	OperationDetail   string     `json:"operation_detail"`
	WeatherCondition  string     `json:"weather_condition"`
}

type ProcessingRecordInfo struct {
	ID                 int64      `json:"id"`
	StartTime          time.Time  `json:"start_time"`
	EndTime            *time.Time `json:"end_time"`
	DurationMinutes    *int       `json:"duration_minutes"`
	Temperature        *float64   `json:"temperature"`
	StepType           string     `json:"step_type"`
	StepCategory       string     `json:"step_category"`
	OperatorName       string     `json:"operator_name"`
	ProcessingDetail   string     `json:"processing_detail"`
	InputQuantity      *float64   `json:"input_quantity"`
	OutputQuantity     *float64   `json:"output_quantity"`
	QualityCheckResult string     `json:"quality_check_result"`
	QualityCheckRemark string     `json:"quality_check_remark"`
}

type SafetyCheckInfo struct {
	Passed bool   `json:"passed"`
	Remark string `json:"remark"`
}

type ScanInfo struct {
	TotalScans int        `json:"total_scans"`
	LastScanAt *time.Time `json:"last_scan_at"`
	QueryTime  time.Time  `json:"query_time"`
}
