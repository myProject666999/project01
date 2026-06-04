package handlers

import (
	"database/sql"
	"time"

	"tcm-traceability/pkg/db"
	"tcm-traceability/pkg/response"

	"github.com/labstack/echo/v4"
)

type ScanHandler struct{}

func NewScanHandler() *ScanHandler {
	return &ScanHandler{}
}

// TraceabilityProductInfo 产品基本信息
type TraceabilityProductInfo struct {
	ID               uint64  `json:"id"`
	ProductCode      string  `json:"product_code"`
	ProductName      string  `json:"product_name"`
	Specification    string  `json:"specification"`
	PackageType      string  `json:"package_type"`
	NetWeight        *float64 `json:"net_weight"`
	ProductionDate   *string `json:"production_date"`
	ShelfLifeMonths  *int    `json:"shelf_life_months"`
	StorageCondition string  `json:"storage_condition"`
	Status           int8    `json:"status"`
	Remark           string  `json:"remark"`
}

// TraceabilityBatchInfo 批次信息
type TraceabilityBatchInfo struct {
	ID               uint64  `json:"id"`
	BatchNo          string  `json:"batch_no"`
	HarvestDate      string  `json:"harvest_date"`
	HarvestQuantity  float64 `json:"harvest_quantity"`
	QualityLevel     string  `json:"quality_level"`
	HarvestMethod    string  `json:"harvest_method"`
	WeatherCondition string  `json:"weather_condition"`
	OperatorName     string  `json:"operator_name"`
}

// TraceabilityPlotInfo 地块信息
type TraceabilityPlotInfo struct {
	ID             uint64   `json:"id"`
	PlotCode       string   `json:"plot_code"`
	Name           string   `json:"name"`
	Province       string   `json:"province"`
	City           string   `json:"city"`
	District       string   `json:"district"`
	Address        string   `json:"address"`
	Longitude      float64  `json:"longitude"`
	Latitude       float64  `json:"latitude"`
	Altitude       *float64 `json:"altitude"`
	SoilType       string   `json:"soil_type"`
	SoilPh         *float64 `json:"soil_ph"`
	Area           *float64 `json:"area"`
	SeedlingSource string   `json:"seedling_source"`
	PlantingDate   *string  `json:"planting_date"`
	OperatorName   string   `json:"operator_name"`
}

// TraceabilityVarietyInfo 品种信息
type TraceabilityVarietyInfo struct {
	ID            uint64 `json:"id"`
	Code          string `json:"code"`
	Name          string `json:"name"`
	Alias         string `json:"alias"`
	ScientificName string `json:"scientific_name"`
	Origin        string `json:"origin"`
	GrowthCycleDays *int  `json:"growth_cycle_days"`
	Description   string `json:"description"`
}

// TraceabilityFarmingRecord 农事记录
type TraceabilityFarmingRecord struct {
	ID                 uint64  `json:"id"`
	RecordNo           string  `json:"record_no"`
	OperationTypeCode  string  `json:"operation_type_code"`
	OperationTypeName  string  `json:"operation_type_name"`
	OperationCategory  string  `json:"operation_category"`
	OperationDate      string  `json:"operation_date"`
	OperatorName       string  `json:"operator_name"`
	FertilizerName     *string `json:"fertilizer_name"`
	FertilizerQuantity *float64 `json:"fertilizer_quantity"`
	PesticideName      *string `json:"pesticide_name"`
	PesticideQuantity  *float64 `json:"pesticide_quantity"`
	SafeIntervalDays   *int    `json:"safe_interval_days"`
	OperationDetail    string  `json:"operation_detail"`
	WeatherCondition   string  `json:"weather_condition"`
	CreatedAt          string  `json:"created_at"`
}

// TraceabilityProcessingRecord 加工记录
type TraceabilityProcessingRecord struct {
	ID                 uint64   `json:"id"`
	RecordNo           string   `json:"record_no"`
	StepTypeCode       string   `json:"step_type_code"`
	StepTypeName       string   `json:"step_type_name"`
	StepCategory       string   `json:"step_category"`
	StartTime          string   `json:"start_time"`
	EndTime            *string  `json:"end_time"`
	DurationMinutes    *int     `json:"duration_minutes"`
	Temperature        *float64 `json:"temperature"`
	OperatorName       string   `json:"operator_name"`
	ProcessingDetail   string   `json:"processing_detail"`
	InputQuantity      *float64 `json:"input_quantity"`
	OutputQuantity     *float64 `json:"output_quantity"`
	QualityCheckResult string   `json:"quality_check_result"`
	QualityCheckRemark string   `json:"quality_check_remark"`
	CreatedAt          string   `json:"created_at"`
}

// TraceabilitySafetyCheck 安全检查结果
type TraceabilitySafetyCheck struct {
	Passed int8   `json:"passed"`
	Remark string `json:"remark"`
}

// TraceabilityResponse 溯源信息响应
type TraceabilityResponse struct {
	QRCode           string                        `json:"qr_code"`
	ScanCount        int                           `json:"scan_count"`
	LastScanAt       *string                       `json:"last_scan_at"`
	Product          TraceabilityProductInfo       `json:"product"`
	Batch            TraceabilityBatchInfo         `json:"batch"`
	Plot             TraceabilityPlotInfo          `json:"plot"`
	Variety          TraceabilityVarietyInfo       `json:"variety"`
	SafetyCheck      TraceabilitySafetyCheck       `json:"safety_check"`
	FarmingRecords   []TraceabilityFarmingRecord   `json:"farming_records"`
	ProcessingRecords []TraceabilityProcessingRecord `json:"processing_records"`
}

// GetTraceability 消费者扫码查询溯源信息（公开接口）
// @Summary 扫码查询溯源信息
// @Description 根据二维码内容查询完整的溯源信息，包含产品、批次、地块、农事记录、加工记录和安全检查结果
// @Tags 扫码查询
// @Accept json
// @Produce json
// @Param qr_code path string true "二维码内容"
// @Success 200 {object} response.Response{data=TraceabilityResponse}
// @Router /scan/{qr_code} [get]
func (h *ScanHandler) GetTraceability(c echo.Context) error {
	qrCode := c.Param("qr_code")
	if qrCode == "" {
		return response.BadRequest(c, "二维码不能为空")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var qrID uint64
	var productID uint64
	var batchID uint64
	var scanCount int
	var lastScanAt sql.NullTime

	qrQuery := `SELECT id, product_id, batch_id, scan_count, last_scan_at 
		FROM qr_codes WHERE qr_code = ? AND status = 1`
	err = database.QueryRow(qrQuery, qrCode).Scan(&qrID, &productID, &batchID, &scanCount, &lastScanAt)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "二维码不存在或已失效")
	}
	if err != nil {
		return response.InternalServerError(c, "查询二维码失败")
	}

	tx, err := database.Begin()
	if err != nil {
		return response.InternalServerError(c, "开启事务失败")
	}
	defer tx.Rollback()

	now := time.Now()
	updateScanSQL := `UPDATE qr_codes SET scan_count = scan_count + 1, last_scan_at = ? WHERE id = ?`
	_, err = tx.Exec(updateScanSQL, now, qrID)
	if err != nil {
		return response.InternalServerError(c, "更新扫码记录失败")
	}

	var resp TraceabilityResponse
	resp.QRCode = qrCode
	resp.ScanCount = scanCount + 1
	if lastScanAt.Valid {
		lastScanStr := lastScanAt.Time.Format("2006-01-02 15:04:05")
		resp.LastScanAt = &lastScanStr
	}

	productQuery := `SELECT p.id, p.product_code, p.product_name, p.specification, 
		p.package_type, p.net_weight, p.production_date, p.shelf_life_months, 
		p.storage_condition, p.status, p.remark 
		FROM products p WHERE p.id = ?`
	var productionDate sql.NullTime
	err = tx.QueryRow(productQuery, productID).Scan(
		&resp.Product.ID, &resp.Product.ProductCode, &resp.Product.ProductName,
		&resp.Product.Specification, &resp.Product.PackageType, &resp.Product.NetWeight,
		&productionDate, &resp.Product.ShelfLifeMonths, &resp.Product.StorageCondition,
		&resp.Product.Status, &resp.Product.Remark)
	if err != nil {
		return response.InternalServerError(c, "查询产品信息失败")
	}
	if productionDate.Valid {
		dateStr := productionDate.Time.Format("2006-01-02")
		resp.Product.ProductionDate = &dateStr
	}

	batchQuery := `SELECT hb.id, hb.batch_no, DATE_FORMAT(hb.harvest_date, '%Y-%m-%d'), 
		hb.quantity, hb.quality_level, hb.harvest_method, hb.weather_condition, 
		op.name, hb.safe_check_passed, hb.safe_check_remark 
		FROM harvest_batches hb 
		LEFT JOIN operators op ON hb.operator_id = op.id 
		WHERE hb.id = ?`
	err = tx.QueryRow(batchQuery, batchID).Scan(
		&resp.Batch.ID, &resp.Batch.BatchNo, &resp.Batch.HarvestDate,
		&resp.Batch.HarvestQuantity, &resp.Batch.QualityLevel, &resp.Batch.HarvestMethod,
		&resp.Batch.WeatherCondition, &resp.Batch.OperatorName,
		&resp.SafetyCheck.Passed, &resp.SafetyCheck.Remark)
	if err != nil {
		return response.InternalServerError(c, "查询批次信息失败")
	}

	plotQuery := `SELECT pl.id, pl.plot_code, pl.name, pl.province, pl.city, pl.district, 
		pl.address, pl.longitude, pl.latitude, pl.altitude, pl.soil_type, pl.soil_ph, 
		pl.area, pl.seedling_source, DATE_FORMAT(pl.planting_date, '%Y-%m-%d'), 
		op.name, hv.id, hv.code, hv.name, hv.alias, hv.scientific_name, 
		hv.origin, hv.growth_cycle_days, hv.description 
		FROM harvest_batches hb 
		INNER JOIN plots pl ON hb.plot_id = pl.id 
		INNER JOIN herb_varieties hv ON hb.variety_id = hv.id 
		LEFT JOIN operators op ON pl.operator_id = op.id 
		WHERE hb.id = ?`
	var plantingDate sql.NullString
	err = tx.QueryRow(plotQuery, batchID).Scan(
		&resp.Plot.ID, &resp.Plot.PlotCode, &resp.Plot.Name,
		&resp.Plot.Province, &resp.Plot.City, &resp.Plot.District,
		&resp.Plot.Address, &resp.Plot.Longitude, &resp.Plot.Latitude,
		&resp.Plot.Altitude, &resp.Plot.SoilType, &resp.Plot.SoilPh,
		&resp.Plot.Area, &resp.Plot.SeedlingSource, &plantingDate,
		&resp.Plot.OperatorName, &resp.Variety.ID, &resp.Variety.Code,
		&resp.Variety.Name, &resp.Variety.Alias, &resp.Variety.ScientificName,
		&resp.Variety.Origin, &resp.Variety.GrowthCycleDays, &resp.Variety.Description)
	if err != nil {
		return response.InternalServerError(c, "查询地块信息失败")
	}
	if plantingDate.Valid {
		resp.Plot.PlantingDate = &plantingDate.String
	}

	farmingQuery := `SELECT fr.id, fr.record_no, fot.code, fot.name, fot.category, 
		DATE_FORMAT(fr.operation_date, '%Y-%m-%d'), op.name, f.name, fr.fertilizer_quantity, 
		p.name, fr.pesticide_quantity, fr.safe_interval_days, fr.operation_detail, 
		fr.weather_condition, DATE_FORMAT(fr.created_at, '%Y-%m-%d %H:%i:%s') 
		FROM farming_records fr 
		INNER JOIN harvest_batches hb ON fr.plot_id = hb.plot_id 
		INNER JOIN farming_operation_types fot ON fr.operation_type_id = fot.id 
		INNER JOIN operators op ON fr.operator_id = op.id 
		LEFT JOIN fertilizers f ON fr.fertilizer_id = f.id 
		LEFT JOIN pesticides p ON fr.pesticide_id = p.id 
		WHERE hb.id = ? 
		ORDER BY fr.operation_date DESC, fr.id DESC`
	farmingRows, err := tx.Query(farmingQuery, batchID)
	if err != nil {
		return response.InternalServerError(c, "查询农事记录失败")
	}
	defer farmingRows.Close()

	resp.FarmingRecords = []TraceabilityFarmingRecord{}
	for farmingRows.Next() {
		var record TraceabilityFarmingRecord
		var fertilizerName sql.NullString
		var fertilizerQuantity sql.NullFloat64
		var pesticideName sql.NullString
		var pesticideQuantity sql.NullFloat64
		var safeIntervalDays sql.NullInt32

		err := farmingRows.Scan(
			&record.ID, &record.RecordNo, &record.OperationTypeCode,
			&record.OperationTypeName, &record.OperationCategory, &record.OperationDate,
			&record.OperatorName, &fertilizerName, &fertilizerQuantity,
			&pesticideName, &pesticideQuantity, &safeIntervalDays,
			&record.OperationDetail, &record.WeatherCondition, &record.CreatedAt)
		if err != nil {
			return response.InternalServerError(c, "解析农事记录失败")
		}

		if fertilizerName.Valid {
			record.FertilizerName = &fertilizerName.String
		}
		if fertilizerQuantity.Valid {
			record.FertilizerQuantity = &fertilizerQuantity.Float64
		}
		if pesticideName.Valid {
			record.PesticideName = &pesticideName.String
		}
		if pesticideQuantity.Valid {
			record.PesticideQuantity = &pesticideQuantity.Float64
		}
		if safeIntervalDays.Valid {
			days := int(safeIntervalDays.Int32)
			record.SafeIntervalDays = &days
		}

		resp.FarmingRecords = append(resp.FarmingRecords, record)
	}

	processingQuery := `SELECT pr.id, pr.record_no, pst.code, pst.name, pst.category, 
		DATE_FORMAT(pr.start_time, '%Y-%m-%d %H:%i:%s'), 
		DATE_FORMAT(pr.end_time, '%Y-%m-%d %H:%i:%s'), pr.duration_minutes, 
		pr.temperature, op.name, pr.processing_detail, pr.input_quantity, 
		pr.output_quantity, pr.quality_check_result, pr.quality_check_remark, 
		DATE_FORMAT(pr.created_at, '%Y-%m-%d %H:%i:%s') 
		FROM processing_records pr 
		INNER JOIN processing_step_types pst ON pr.step_type_id = pst.id 
		INNER JOIN operators op ON pr.operator_id = op.id 
		WHERE pr.batch_id = ? 
		ORDER BY pr.start_time DESC, pr.id DESC`
	processingRows, err := tx.Query(processingQuery, batchID)
	if err != nil {
		return response.InternalServerError(c, "查询加工记录失败")
	}
	defer processingRows.Close()

	resp.ProcessingRecords = []TraceabilityProcessingRecord{}
	for processingRows.Next() {
		var record TraceabilityProcessingRecord
		var endTime sql.NullString
		var durationMinutes sql.NullInt32
		var temperature sql.NullFloat64
		var inputQuantity sql.NullFloat64
		var outputQuantity sql.NullFloat64

		err := processingRows.Scan(
			&record.ID, &record.RecordNo, &record.StepTypeCode,
			&record.StepTypeName, &record.StepCategory, &record.StartTime,
			&endTime, &durationMinutes, &temperature, &record.OperatorName,
			&record.ProcessingDetail, &inputQuantity, &outputQuantity,
			&record.QualityCheckResult, &record.QualityCheckRemark, &record.CreatedAt)
		if err != nil {
			return response.InternalServerError(c, "解析加工记录失败")
		}

		if endTime.Valid {
			record.EndTime = &endTime.String
		}
		if durationMinutes.Valid {
			dur := int(durationMinutes.Int32)
			record.DurationMinutes = &dur
		}
		if temperature.Valid {
			record.Temperature = &temperature.Float64
		}
		if inputQuantity.Valid {
			record.InputQuantity = &inputQuantity.Float64
		}
		if outputQuantity.Valid {
			record.OutputQuantity = &outputQuantity.Float64
		}

		resp.ProcessingRecords = append(resp.ProcessingRecords, record)
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	c.Response().Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Response().Header().Set("Pragma", "no-cache")
	c.Response().Header().Set("Expires", "0")

	return response.Success(c, resp)
}
