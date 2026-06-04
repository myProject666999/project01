package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"
	"time"

	"tcm-traceability/models"
	"tcm-traceability/pkg/db"
	"tcm-traceability/pkg/response"
	"tcm-traceability/utils"

	"github.com/labstack/echo/v4"
)

type HarvestBatchHandler struct{}

func NewHarvestBatchHandler() *HarvestBatchHandler {
	return &HarvestBatchHandler{}
}

// generateBatchNo 调用存储过程生成批次号
func generateBatchNo(database *sql.DB) (string, error) {
	var batchNo string
	query := `CALL sp_generate_batch_no(?)`

	stmt, err := database.Prepare(query)
	if err != nil {
		return "", err
	}
	defer stmt.Close()

	_, err = stmt.Exec(sql.Named("p_batch_no", sql.Out{Dest: &batchNo}))
	if err != nil {
		return "", err
	}

	return batchNo, nil
}

// GetList 分页查询采收批次列表
// @Summary 分页查询采收批次列表
// @Description 根据条件分页查询采收批次，支持按地块、品种、采收日期范围、安全检查状态筛选
// @Tags 采收批次
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param plot_id query int false "地块ID"
// @Param variety_id query int false "品种ID"
// @Param start_date query string false "采收开始日期（YYYY-MM-DD）"
// @Param end_date query string false "采收结束日期（YYYY-MM-DD）"
// @Param safe_check_passed query int false "安全检查状态：1-通过 0-不通过"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.HarvestBatch}}
// @Router /api/harvest-batches [get]
func (h *HarvestBatchHandler) GetList(c echo.Context) error {
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

	plotIDStr := c.QueryParam("plot_id")
	varietyIDStr := c.QueryParam("variety_id")
	startDate := c.QueryParam("start_date")
	endDate := c.QueryParam("end_date")
	safeCheckPassedStr := c.QueryParam("safe_check_passed")

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

	if plotIDStr != "" {
		plotID, _ := strconv.ParseUint(plotIDStr, 10, 64)
		whereClauses = append(whereClauses, "plot_id = ?")
		args = append(args, plotID)
	}
	if varietyIDStr != "" {
		varietyID, _ := strconv.ParseUint(varietyIDStr, 10, 64)
		whereClauses = append(whereClauses, "variety_id = ?")
		args = append(args, varietyID)
	}
	if startDate != "" {
		whereClauses = append(whereClauses, "harvest_date >= ?")
		args = append(args, startDate)
	}
	if endDate != "" {
		whereClauses = append(whereClauses, "harvest_date <= ?")
		args = append(args, endDate)
	}
	if safeCheckPassedStr != "" {
		safeCheckPassed, _ := strconv.Atoi(safeCheckPassedStr)
		whereClauses = append(whereClauses, "safe_check_passed = ?")
		args = append(args, safeCheckPassed)
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	countSQL := "SELECT COUNT(*) FROM harvest_batches" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, batch_no, plot_id, variety_id, harvest_date, quantity, quality_level, 
		operator_id, harvest_method, weather_condition, safe_check_passed, safe_check_remark, 
		status, remark, created_at, updated_at 
		FROM harvest_batches` + whereSQL + ` ORDER BY harvest_date DESC, id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var batches []models.HarvestBatch
	for rows.Next() {
		var b models.HarvestBatch
		err := rows.Scan(&b.ID, &b.BatchNo, &b.PlotID, &b.VarietyID, &b.HarvestDate,
			&b.Quantity, &b.QualityLevel, &b.OperatorID, &b.HarvestMethod, &b.WeatherCondition,
			&b.SafeCheckPassed, &b.SafeCheckRemark, &b.Status, &b.Remark, &b.CreatedAt, &b.UpdatedAt)
		if err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}
		batches = append(batches, b)
	}

	if batches == nil {
		batches = []models.HarvestBatch{}
	}

	return response.SuccessWithPaginated(c, batches, total, page, pageSize)
}

// GetByID 根据ID获取采收批次详情
// @Summary 获取采收批次详情
// @Description 根据ID获取采收批次详细信息，包含关联的地块、品种、负责人信息
// @Tags 采收批次
// @Accept json
// @Produce json
// @Param id path int true "批次ID"
// @Success 200 {object} response.Response{data=models.HarvestBatchDetail}
// @Router /api/harvest-batches/{id} [get]
func (h *HarvestBatchHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var d models.HarvestBatchDetail
	querySQL := `SELECT hb.id, hb.batch_no, hb.plot_id, hb.variety_id, hb.harvest_date, 
		hb.quantity, hb.quality_level, hb.operator_id, hb.harvest_method, hb.weather_condition, 
		hb.safe_check_passed, hb.safe_check_remark, hb.status, hb.remark, hb.created_at, hb.updated_at, 
		pl.plot_code, pl.name AS plot_name, hv.code AS variety_code, hv.name AS variety_name, 
		op.name AS operator_name 
		FROM harvest_batches hb 
		LEFT JOIN plots pl ON hb.plot_id = pl.id 
		LEFT JOIN herb_varieties hv ON hb.variety_id = hv.id 
		LEFT JOIN operators op ON hb.operator_id = op.id 
		WHERE hb.id = ?`

	var plotCode, plotName, varietyCode, varietyName, operatorName sql.NullString

	err = database.QueryRow(querySQL, id).Scan(&d.ID, &d.BatchNo, &d.PlotID, &d.VarietyID,
		&d.HarvestDate, &d.Quantity, &d.QualityLevel, &d.OperatorID, &d.HarvestMethod,
		&d.WeatherCondition, &d.SafeCheckPassed, &d.SafeCheckRemark, &d.Status, &d.Remark,
		&d.CreatedAt, &d.UpdatedAt, &plotCode, &plotName, &varietyCode, &varietyName, &operatorName)

	if err == sql.ErrNoRows {
		return response.NotFound(c, "采收批次不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	if plotCode.Valid {
		d.PlotCode = plotCode.String
	}
	if plotName.Valid {
		d.PlotName = plotName.String
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

	return response.Success(c, d)
}

// Create 创建采收批次
// @Summary 创建采收批次
// @Description 新增采收批次，调用存储过程生成batch_no；调用安全间隔期检查存储过程sp_check_safety_interval，根据结果设置safe_check_passed和safe_check_remark；只有检查通过才能继续后续流程
// @Tags 采收批次
// @Accept json
// @Produce json
// @Param harvest_batch body models.HarvestBatchCreateRequest true "采收批次信息"
// @Success 200 {object} response.Response{data=map[string]int64}
// @Router /api/harvest-batches [post]
func (h *HarvestBatchHandler) Create(c echo.Context) error {
	var req models.HarvestBatchCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.PlotID <= 0 {
		return response.BadRequest(c, "地块ID无效")
	}
	if req.VarietyID <= 0 {
		return response.BadRequest(c, "品种ID无效")
	}
	if req.OperatorID <= 0 {
		return response.BadRequest(c, "负责人ID无效")
	}
	if req.HarvestDate == "" {
		return response.BadRequest(c, "采收日期不能为空")
	}
	if req.Quantity <= 0 {
		return response.BadRequest(c, "采收重量必须大于0")
	}

	harvestDate, err := time.Parse("2006-01-02", req.HarvestDate)
	if err != nil {
		return response.BadRequest(c, "采收日期格式错误，应为YYYY-MM-DD")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	batchNo, err := generateBatchNo(database)
	if err != nil {
		return response.InternalServerError(c, "生成批次号失败")
	}

	safetyResult, err := utils.CheckSafetyInterval(database, int64(req.PlotID), harvestDate)
	if err != nil {
		return response.InternalServerError(c, "安全间隔期检查失败："+err.Error())
	}

	if !safetyResult.Passed {
		return response.BadRequest(c, "安全间隔期检查不通过："+safetyResult.Remark)
	}

	tx, err := database.Begin()
	if err != nil {
		return response.InternalServerError(c, "开启事务失败")
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	safeCheckPassed := int8(0)
	if safetyResult.Passed {
		safeCheckPassed = 1
	}

	status := req.Status
	if status == 0 {
		status = 1
	}

	insertSQL := `INSERT INTO harvest_batches (batch_no, plot_id, variety_id, harvest_date, quantity, 
		quality_level, operator_id, harvest_method, weather_condition, safe_check_passed, 
		safe_check_remark, status, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	result, err := tx.Exec(insertSQL, batchNo, req.PlotID, req.VarietyID, harvestDate, req.Quantity,
		req.QualityLevel, req.OperatorID, req.HarvestMethod, req.WeatherCondition, safeCheckPassed,
		safetyResult.Remark, status, req.Remark)
	if err != nil {
		return response.InternalServerError(c, "创建失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	if err = tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	return response.Success(c, map[string]int64{"id": id})
}

// Update 更新采收批次
// @Summary 更新采收批次
// @Description 根据ID更新采收批次信息
// @Tags 采收批次
// @Accept json
// @Produce json
// @Param id path int true "批次ID"
// @Param harvest_batch body models.HarvestBatchUpdateRequest true "更新的采收批次信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/harvest-batches/{id} [put]
func (h *HarvestBatchHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req models.HarvestBatchUpdateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var existingCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM harvest_batches WHERE id = ?", id).Scan(&existingCount); err != nil {
		return response.InternalServerError(c, "检查批次是否存在失败")
	}
	if existingCount == 0 {
		return response.NotFound(c, "采收批次不存在")
	}

	var setClauses []string
	var args []interface{}

	if req.PlotID != nil {
		setClauses = append(setClauses, "plot_id = ?")
		args = append(args, *req.PlotID)
	}
	if req.VarietyID != nil {
		setClauses = append(setClauses, "variety_id = ?")
		args = append(args, *req.VarietyID)
	}
	if req.HarvestDate != "" || req.PlotID != nil {
		var currentPlotID uint64
		var currentHarvestDateStr string

		querySQL := `SELECT plot_id, DATE_FORMAT(harvest_date, '%Y-%m-%d') FROM harvest_batches WHERE id = ?`
		err = database.QueryRow(querySQL, id).Scan(&currentPlotID, &currentHarvestDateStr)
		if err != nil {
			return response.InternalServerError(c, "查询当前批次信息失败")
		}

		plotIDForCheck := currentPlotID
		if req.PlotID != nil {
			plotIDForCheck = *req.PlotID
		}

		harvestDateForCheck := currentHarvestDateStr
		if req.HarvestDate != "" {
			harvestDateForCheck = req.HarvestDate
		}

		hd, err := time.Parse("2006-01-02", harvestDateForCheck)
		if err != nil {
			return response.BadRequest(c, "采收日期格式错误，应为YYYY-MM-DD")
		}

		safetyResult, err := utils.CheckSafetyInterval(database, int64(plotIDForCheck), hd)
		if err != nil {
			return response.InternalServerError(c, "安全间隔期检查失败："+err.Error())
		}

		if !safetyResult.Passed {
			return response.BadRequest(c, "安全间隔期检查不通过："+safetyResult.Remark)
		}

		safeCheckPassed := int8(0)
		if safetyResult.Passed {
			safeCheckPassed = 1
		}

		setClauses = append(setClauses, "safe_check_passed = ?, safe_check_remark = ?")
		args = append(args, safeCheckPassed, safetyResult.Remark)

		if req.HarvestDate != "" {
			setClauses = append(setClauses, "harvest_date = ?")
			args = append(args, hd)
		}
	}
	if req.Quantity != nil {
		setClauses = append(setClauses, "quantity = ?")
		args = append(args, *req.Quantity)
	}
	if req.QualityLevel != "" {
		setClauses = append(setClauses, "quality_level = ?")
		args = append(args, req.QualityLevel)
	}
	if req.OperatorID != nil {
		setClauses = append(setClauses, "operator_id = ?")
		args = append(args, *req.OperatorID)
	}
	if req.HarvestMethod != "" {
		setClauses = append(setClauses, "harvest_method = ?")
		args = append(args, req.HarvestMethod)
	}
	if req.WeatherCondition != "" {
		setClauses = append(setClauses, "weather_condition = ?")
		args = append(args, req.WeatherCondition)
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
	updateSQL := "UPDATE harvest_batches SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "采收批次不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除采收批次
// @Summary 删除采收批次
// @Description 根据ID删除采收批次
// @Tags 采收批次
// @Accept json
// @Produce json
// @Param id path int true "批次ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/harvest-batches/{id} [delete]
func (h *HarvestBatchHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var processingCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM processing_records WHERE batch_id = ?", id).Scan(&processingCount); err != nil {
		return response.InternalServerError(c, "检查关联加工记录失败")
	}
	if processingCount > 0 {
		return response.BadRequest(c, "该批次已有关联的加工记录，无法删除")
	}

	var productCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM products WHERE batch_id = ?", id).Scan(&productCount); err != nil {
		return response.InternalServerError(c, "检查关联产品失败")
	}
	if productCount > 0 {
		return response.BadRequest(c, "该批次已有关联的产品，无法删除")
	}

	deleteSQL := "DELETE FROM harvest_batches WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "采收批次不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}
