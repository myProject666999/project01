package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"tcm-traceability/models"
	"tcm-traceability/pkg/db"
	"tcm-traceability/pkg/response"

	"github.com/labstack/echo/v4"
)

type PlotHandler struct{}

func NewPlotHandler() *PlotHandler {
	return &PlotHandler{}
}

// generatePlotCode 生成地块编号，格式：PLOT-YYYY-XXX
func generatePlotCode(database *sql.DB) (string, error) {
	year := time.Now().Year()
	prefix := fmt.Sprintf("PLOT-%d-", year)

	var maxSuffix int
	querySQL := `SELECT COALESCE(MAX(CAST(SUBSTRING(plot_code, ?) AS UNSIGNED)), 0) 
		FROM plots WHERE plot_code LIKE ?`
	prefixLen := len(prefix) + 1
	err := database.QueryRow(querySQL, prefixLen, prefix+"%").Scan(&maxSuffix)
	if err != nil {
		return "", fmt.Errorf("生成地块编号失败: %w", err)
	}

	suffix := maxSuffix + 1
	plotCode := fmt.Sprintf("%s%03d", prefix, suffix)

	var exists int
	checkSQL := `SELECT COUNT(*) FROM plots WHERE plot_code = ?`
	for {
		err = database.QueryRow(checkSQL, plotCode).Scan(&exists)
		if err != nil {
			return "", fmt.Errorf("检查地块编号重复失败: %w", err)
		}
		if exists == 0 {
			break
		}
		suffix++
		plotCode = fmt.Sprintf("%s%03d", prefix, suffix)
	}

	return plotCode, nil
}

// GetList 分页查询地块列表
// @Summary 分页查询地块列表
// @Description 根据条件分页查询地块档案，支持按省份、品种、状态筛选
// @Tags 地块档案
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param province query string false "省份（模糊查询）"
// @Param variety_id query int false "品种ID"
// @Param status query int false "状态：1-种植中 2-已采收 0-废弃"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.Plot}}
// @Router /api/plots [get]
func (h *PlotHandler) GetList(c echo.Context) error {
	pageStr := c.QueryParam("page")
	if pageStr == "" {
		pageStr = "1"
	}
	page, _ := strconv.Atoi(pageStr)

	pageSizeStr := c.QueryParam("page_size")
	if pageSizeStr == "" {
		pageSizeStr = "10"
	}
	pageSize, _ := strconv.Atoi(pageSizeStr)

	province := c.QueryParam("province")
	varietyIDStr := c.QueryParam("variety_id")
	statusStr := c.QueryParam("status")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var whereClauses []string
	var args []interface{}

	if province != "" {
		whereClauses = append(whereClauses, "province LIKE ?")
		args = append(args, "%"+province+"%")
	}
	if varietyIDStr != "" {
		varietyID, _ := strconv.ParseInt(varietyIDStr, 10, 64)
		whereClauses = append(whereClauses, "variety_id = ?")
		args = append(args, varietyID)
	}
	if statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		whereClauses = append(whereClauses, "status = ?")
		args = append(args, status)
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	countSQL := "SELECT COUNT(*) FROM plots" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, plot_code, name, province, city, district, address, longitude, 
		latitude, altitude, soil_type, soil_ph, area, seedling_source, variety_id, 
		planting_date, expected_harvest_date, operator_id, status, remark, created_at, updated_at 
		FROM plots` + whereSQL + ` ORDER BY id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var plots []models.Plot
	for rows.Next() {
		var p models.Plot
		var plantingDate, expectedHarvestDate sql.NullTime
		var altitude, soilPh, area sql.NullFloat64
		var operatorID sql.NullInt64

		err := rows.Scan(&p.ID, &p.PlotCode, &p.Name, &p.Province, &p.City, &p.District,
			&p.Address, &p.Longitude, &p.Latitude, &altitude, &p.SoilType, &soilPh,
			&area, &p.SeedlingSource, &p.VarietyID, &plantingDate, &expectedHarvestDate,
			&operatorID, &p.Status, &p.Remark, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}

		if altitude.Valid {
			p.Altitude = &altitude.Float64
		}
		if soilPh.Valid {
			p.SoilPh = &soilPh.Float64
		}
		if area.Valid {
			p.Area = &area.Float64
		}
		if plantingDate.Valid {
			p.PlantingDate = &plantingDate.Time
		}
		if expectedHarvestDate.Valid {
			p.ExpectedHarvestDate = &expectedHarvestDate.Time
		}
		if operatorID.Valid {
			oid := operatorID.Int64
			p.OperatorID = (*int64)(&oid)
		}

		plots = append(plots, p)
	}

	if plots == nil {
		plots = []models.Plot{}
	}

	return response.SuccessWithPaginated(c, plots, total, page, pageSize)
}

// GetByID 根据ID获取地块详情
// @Summary 获取地块详情
// @Description 根据ID获取地块详细信息，包含关联的品种和负责人信息
// @Tags 地块档案
// @Accept json
// @Produce json
// @Param id path int true "地块ID"
// @Success 200 {object} response.Response{data=models.PlotDetail}
// @Router /api/plots/{id} [get]
func (h *PlotHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var d models.PlotDetail
	querySQL := `SELECT p.id, p.plot_code, p.name, p.province, p.city, p.district, p.address, 
		p.longitude, p.latitude, p.altitude, p.soil_type, p.soil_ph, p.area, p.seedling_source, 
		p.variety_id, p.planting_date, p.expected_harvest_date, p.operator_id, p.status, p.remark, 
		p.created_at, p.updated_at, hv.code AS variety_code, hv.name AS variety_name, 
		op.name AS operator_name, op.phone AS operator_phone 
		FROM plots p 
		LEFT JOIN herb_varieties hv ON p.variety_id = hv.id 
		LEFT JOIN operators op ON p.operator_id = op.id 
		WHERE p.id = ?`

	var plantingDate, expectedHarvestDate sql.NullTime
	var altitude, soilPh, area sql.NullFloat64
	var operatorID sql.NullInt64
	var varietyCode, varietyName, operatorName, operatorPhone sql.NullString

	err = database.QueryRow(querySQL, id).Scan(&d.ID, &d.PlotCode, &d.Name, &d.Province,
		&d.City, &d.District, &d.Address, &d.Longitude, &d.Latitude, &altitude, &d.SoilType,
		&soilPh, &area, &d.SeedlingSource, &d.VarietyID, &plantingDate, &expectedHarvestDate,
		&operatorID, &d.Status, &d.Remark, &d.CreatedAt, &d.UpdatedAt, &varietyCode, &varietyName,
		&operatorName, &operatorPhone)

	if err == sql.ErrNoRows {
		return response.NotFound(c, "地块不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	if altitude.Valid {
		d.Altitude = &altitude.Float64
	}
	if soilPh.Valid {
		d.SoilPh = &soilPh.Float64
	}
	if area.Valid {
		d.Area = &area.Float64
	}
	if plantingDate.Valid {
		d.PlantingDate = &plantingDate.Time
	}
	if expectedHarvestDate.Valid {
		d.ExpectedHarvestDate = &expectedHarvestDate.Time
	}
	if operatorID.Valid {
		oid := operatorID.Int64
		d.OperatorID = (*int64)(&oid)
	}
	if varietyCode.Valid {
		d.VarietyCode = varietyCode.String
	}
	if varietyName.Valid {
		d.VarietyName = varietyName.String
	}
	if operatorName.Valid {
		d.OperatorName = operatorName.String
	}
	if operatorPhone.Valid {
		d.OperatorPhone = operatorPhone.String
	}

	return response.Success(c, d)
}

// Create 创建地块
// @Summary 创建地块
// @Description 新增地块档案，自动生成plot_code，格式PLOT-YYYY-XXX
// @Tags 地块档案
// @Accept json
// @Produce json
// @Param plot body models.PlotCreateRequest true "地块信息"
// @Success 200 {object} response.Response{data=map[string]int64}
// @Router /api/plots [post]
func (h *PlotHandler) Create(c echo.Context) error {
	var req models.PlotCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.Name == "" {
		return response.BadRequest(c, "地块名称不能为空")
	}
	if req.Province == "" {
		return response.BadRequest(c, "省份不能为空")
	}
	if req.SeedlingSource == "" {
		return response.BadRequest(c, "种苗来源不能为空")
	}
	if req.VarietyID <= 0 {
		return response.BadRequest(c, "品种ID无效")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	plotCode, err := generatePlotCode(database)
	if err != nil {
		return response.InternalServerError(c, err.Error())
	}

	var plantingDate, expectedHarvestDate interface{}
	if req.PlantingDate != "" {
		pd, err := time.Parse("2006-01-02", req.PlantingDate)
		if err != nil {
			return response.BadRequest(c, "种植日期格式错误，应为YYYY-MM-DD")
		}
		plantingDate = pd
	} else {
		plantingDate = nil
	}

	if req.ExpectedHarvestDate != "" {
		ehd, err := time.Parse("2006-01-02", req.ExpectedHarvestDate)
		if err != nil {
			return response.BadRequest(c, "预计采收日期格式错误，应为YYYY-MM-DD")
		}
		expectedHarvestDate = ehd
	} else {
		expectedHarvestDate = nil
	}

	status := req.Status
	if status == 0 && c.Request().Body != http.NoBody {
		status = 1
	}

	insertSQL := `INSERT INTO plots (plot_code, name, province, city, district, address, longitude, 
		latitude, altitude, soil_type, soil_ph, area, seedling_source, variety_id, planting_date, 
		expected_harvest_date, operator_id, status, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	result, err := database.Exec(insertSQL, plotCode, req.Name, req.Province, req.City, req.District,
		req.Address, req.Longitude, req.Latitude, req.Altitude, req.SoilType, req.SoilPh, req.Area,
		req.SeedlingSource, req.VarietyID, plantingDate, expectedHarvestDate, req.OperatorID, status, req.Remark)
	if err != nil {
		return response.InternalServerError(c, "创建失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	return response.Success(c, map[string]int64{"id": id})
}

// Update 更新地块
// @Summary 更新地块
// @Description 根据ID更新地块信息
// @Tags 地块档案
// @Accept json
// @Produce json
// @Param id path int true "地块ID"
// @Param plot body models.PlotUpdateRequest true "更新的地块信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/plots/{id} [put]
func (h *PlotHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req models.PlotUpdateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var existingCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM plots WHERE id = ?", id).Scan(&existingCount); err != nil {
		return response.InternalServerError(c, "检查地块是否存在失败")
	}
	if existingCount == 0 {
		return response.NotFound(c, "地块不存在")
	}

	var setClauses []string
	var args []interface{}

	if req.Name != "" {
		setClauses = append(setClauses, "name = ?")
		args = append(args, req.Name)
	}
	if req.Province != "" {
		setClauses = append(setClauses, "province = ?")
		args = append(args, req.Province)
	}
	if req.City != "" {
		setClauses = append(setClauses, "city = ?")
		args = append(args, req.City)
	}
	if req.District != "" {
		setClauses = append(setClauses, "district = ?")
		args = append(args, req.District)
	}
	if req.Address != "" {
		setClauses = append(setClauses, "address = ?")
		args = append(args, req.Address)
	}
	if req.Longitude != nil {
		setClauses = append(setClauses, "longitude = ?")
		args = append(args, *req.Longitude)
	}
	if req.Latitude != nil {
		setClauses = append(setClauses, "latitude = ?")
		args = append(args, *req.Latitude)
	}
	if req.Altitude != nil {
		setClauses = append(setClauses, "altitude = ?")
		args = append(args, req.Altitude)
	}
	if req.SoilType != "" {
		setClauses = append(setClauses, "soil_type = ?")
		args = append(args, req.SoilType)
	}
	if req.SoilPh != nil {
		setClauses = append(setClauses, "soil_ph = ?")
		args = append(args, req.SoilPh)
	}
	if req.Area != nil {
		setClauses = append(setClauses, "area = ?")
		args = append(args, req.Area)
	}
	if req.SeedlingSource != "" {
		setClauses = append(setClauses, "seedling_source = ?")
		args = append(args, req.SeedlingSource)
	}
	if req.VarietyID != nil {
		setClauses = append(setClauses, "variety_id = ?")
		args = append(args, *req.VarietyID)
	}
	if req.PlantingDate != "" {
		pd, err := time.Parse("2006-01-02", req.PlantingDate)
		if err != nil {
			return response.BadRequest(c, "种植日期格式错误，应为YYYY-MM-DD")
		}
		setClauses = append(setClauses, "planting_date = ?")
		args = append(args, pd)
	}
	if req.ExpectedHarvestDate != "" {
		ehd, err := time.Parse("2006-01-02", req.ExpectedHarvestDate)
		if err != nil {
			return response.BadRequest(c, "预计采收日期格式错误，应为YYYY-MM-DD")
		}
		setClauses = append(setClauses, "expected_harvest_date = ?")
		args = append(args, ehd)
	}
	if req.OperatorID != nil {
		setClauses = append(setClauses, "operator_id = ?")
		args = append(args, req.OperatorID)
	}
	if req.Status != 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "status = ?")
		args = append(args, req.Status)
	}
	if req.Remark != "" {
		setClauses = append(setClauses, "remark = ?")
		args = append(args, req.Remark)
	}

	if len(setClauses) == 0 {
		return response.BadRequest(c, "没有需要更新的字段")
	}

	args = append(args, id)
	updateSQL := "UPDATE plots SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "地块不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除地块
// @Summary 删除地块
// @Description 根据ID删除地块，删除前检查是否有关联的农事记录或采收批次
// @Tags 地块档案
// @Accept json
// @Produce json
// @Param id path int true "地块ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/plots/{id} [delete]
func (h *PlotHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var farmingCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM farming_records WHERE plot_id = ?", id).Scan(&farmingCount); err != nil {
		return response.InternalServerError(c, "检查关联农事记录失败")
	}
	if farmingCount > 0 {
		return response.BadRequest(c, "该地块已有关联的农事记录，无法删除")
	}

	var batchCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM harvest_batches WHERE plot_id = ?", id).Scan(&batchCount); err != nil {
		return response.InternalServerError(c, "检查关联采收批次失败")
	}
	if batchCount > 0 {
		return response.BadRequest(c, "该地块已有关联的采收批次，无法删除")
	}

	deleteSQL := "DELETE FROM plots WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "地块不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}
