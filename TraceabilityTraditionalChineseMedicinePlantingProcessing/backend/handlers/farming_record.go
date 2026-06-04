package handlers

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"time"

	"tcm-traceability/models"
	"tcm-traceability/pkg/db"
	"tcm-traceability/pkg/response"

	"github.com/labstack/echo/v4"
)

type FarmingRecordHandler struct{}

func NewFarmingRecordHandler() *FarmingRecordHandler {
	return &FarmingRecordHandler{}
}

// generateRecordNo 生成农事记录编号，格式：FR-YYYYMMDD-XXX
func generateFarmingRecordNo(database *sql.DB) (string, error) {
	now := time.Now()
	prefix := fmt.Sprintf("FR-%s-", now.Format("20060102"))

	var maxSuffix int
	querySQL := `SELECT COALESCE(MAX(CAST(SUBSTRING(record_no, ?) AS UNSIGNED)), 0) 
		FROM farming_records WHERE record_no LIKE ?`
	prefixLen := len(prefix) + 1
	err := database.QueryRow(querySQL, prefixLen, prefix+"%").Scan(&maxSuffix)
	if err != nil {
		return "", fmt.Errorf("生成农事记录编号失败: %w", err)
	}

	suffix := maxSuffix + 1
	recordNo := fmt.Sprintf("%s%03d", prefix, suffix)

	var exists int
	checkSQL := `SELECT COUNT(*) FROM farming_records WHERE record_no = ?`
	for {
		err = database.QueryRow(checkSQL, recordNo).Scan(&exists)
		if err != nil {
			return "", fmt.Errorf("检查农事记录编号重复失败: %w", err)
		}
		if exists == 0 {
			break
		}
		suffix++
		recordNo = fmt.Sprintf("%s%03d", prefix, suffix)
	}

	return recordNo, nil
}

// getSafeIntervalDays 获取农药安全间隔期
func getSafeIntervalDays(database *sql.DB, pesticideID uint64) (int, error) {
	var safeIntervalDays int
	querySQL := `SELECT safe_interval_days FROM pesticides WHERE id = ?`
	err := database.QueryRow(querySQL, pesticideID).Scan(&safeIntervalDays)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("农药不存在")
		}
		return 0, fmt.Errorf("查询农药安全间隔期失败: %w", err)
	}
	return safeIntervalDays, nil
}

// isPesticideOperation 判断是否为打药操作
func isPesticideOperation(database *sql.DB, operationTypeID uint64) (bool, error) {
	var category string
	querySQL := `SELECT category FROM farming_operation_types WHERE id = ?`
	err := database.QueryRow(querySQL, operationTypeID).Scan(&category)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, fmt.Errorf("操作类型不存在")
		}
		return false, fmt.Errorf("查询操作类型失败: %w", err)
	}
	return category == "pesticide", nil
}

// GetList 分页查询农事记录列表
// @Summary 分页查询农事记录列表
// @Description 根据条件分页查询农事记录，支持按地块、操作类型、日期范围筛选
// @Tags 农事记录
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param plot_id query int false "地块ID"
// @Param operation_type_id query int false "操作类型ID"
// @Param start_date query string false "开始日期（YYYY-MM-DD）"
// @Param end_date query string false "结束日期（YYYY-MM-DD）"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.FarmingRecord}}
// @Router /api/farming-records [get]
func (h *FarmingRecordHandler) GetList(c echo.Context) error {
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
	operationTypeIDStr := c.QueryParam("operation_type_id")
	startDate := c.QueryParam("start_date")
	endDate := c.QueryParam("end_date")

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
	if operationTypeIDStr != "" {
		operationTypeID, _ := strconv.ParseUint(operationTypeIDStr, 10, 64)
		whereClauses = append(whereClauses, "operation_type_id = ?")
		args = append(args, operationTypeID)
	}
	if startDate != "" {
		whereClauses = append(whereClauses, "operation_date >= ?")
		args = append(args, startDate)
	}
	if endDate != "" {
		whereClauses = append(whereClauses, "operation_date <= ?")
		args = append(args, endDate)
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	countSQL := "SELECT COUNT(*) FROM farming_records" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, record_no, plot_id, operation_type_id, operation_date, operator_id, 
		fertilizer_id, fertilizer_quantity, pesticide_id, pesticide_quantity, safe_interval_days, 
		operation_detail, weather_condition, remark, created_at, updated_at 
		FROM farming_records` + whereSQL + ` ORDER BY operation_date DESC, id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var records []models.FarmingRecord
	for rows.Next() {
		var r models.FarmingRecord
		var fertilizerID, pesticideID sql.NullInt64
		var fertilizerQuantity, pesticideQuantity sql.NullFloat64
		var safeIntervalDays sql.NullInt64

		err := rows.Scan(&r.ID, &r.RecordNo, &r.PlotID, &r.OperationTypeID, &r.OperationDate,
			&r.OperatorID, &fertilizerID, &fertilizerQuantity, &pesticideID, &pesticideQuantity,
			&safeIntervalDays, &r.OperationDetail, &r.WeatherCondition, &r.Remark,
			&r.CreatedAt, &r.UpdatedAt)
		if err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}

		if fertilizerID.Valid {
			fid := uint64(fertilizerID.Int64)
			r.FertilizerID = &fid
		}
		if fertilizerQuantity.Valid {
			fq := fertilizerQuantity.Float64
			r.FertilizerQuantity = &fq
		}
		if pesticideID.Valid {
			pid := uint64(pesticideID.Int64)
			r.PesticideID = &pid
		}
		if pesticideQuantity.Valid {
			pq := pesticideQuantity.Float64
			r.PesticideQuantity = &pq
		}
		if safeIntervalDays.Valid {
			sid := int(safeIntervalDays.Int64)
			r.SafeIntervalDays = &sid
		}

		records = append(records, r)
	}

	if records == nil {
		records = []models.FarmingRecord{}
	}

	return response.SuccessWithPaginated(c, records, total, page, pageSize)
}

// GetByID 根据ID获取农事记录详情
// @Summary 获取农事记录详情
// @Description 根据ID获取农事记录详细信息，包含关联的地块、操作类型、操作人、肥料、农药信息
// @Tags 农事记录
// @Accept json
// @Produce json
// @Param id path int true "记录ID"
// @Success 200 {object} response.Response{data=models.FarmingRecordDetail}
// @Router /api/farming-records/{id} [get]
func (h *FarmingRecordHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var d models.FarmingRecordDetail
	querySQL := `SELECT fr.id, fr.record_no, fr.plot_id, fr.operation_type_id, fr.operation_date, 
		fr.operator_id, fr.fertilizer_id, fr.fertilizer_quantity, fr.pesticide_id, 
		fr.pesticide_quantity, fr.safe_interval_days, fr.operation_detail, fr.weather_condition, 
		fr.remark, fr.created_at, fr.updated_at, pl.plot_code, pl.name AS plot_name, 
		fot.code AS operation_type_code, fot.name AS operation_type_name, fot.category AS operation_category, 
		op.name AS operator_name, f.name AS fertilizer_name, p.name AS pesticide_name 
		FROM farming_records fr 
		LEFT JOIN plots pl ON fr.plot_id = pl.id 
		LEFT JOIN farming_operation_types fot ON fr.operation_type_id = fot.id 
		LEFT JOIN operators op ON fr.operator_id = op.id 
		LEFT JOIN fertilizers f ON fr.fertilizer_id = f.id 
		LEFT JOIN pesticides p ON fr.pesticide_id = p.id 
		WHERE fr.id = ?`

	var fertilizerID, pesticideID sql.NullInt64
	var fertilizerQuantity, pesticideQuantity sql.NullFloat64
	var safeIntervalDays sql.NullInt64
	var plotCode, plotName, operationTypeCode, operationTypeName, operationCategory, operatorName, fertilizerName, pesticideName sql.NullString

	err = database.QueryRow(querySQL, id).Scan(&d.ID, &d.RecordNo, &d.PlotID, &d.OperationTypeID,
		&d.OperationDate, &d.OperatorID, &fertilizerID, &fertilizerQuantity, &pesticideID,
		&pesticideQuantity, &safeIntervalDays, &d.OperationDetail, &d.WeatherCondition, &d.Remark,
		&d.CreatedAt, &d.UpdatedAt, &plotCode, &plotName, &operationTypeCode, &operationTypeName,
		&operationCategory, &operatorName, &fertilizerName, &pesticideName)

	if err == sql.ErrNoRows {
		return response.NotFound(c, "农事记录不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	if fertilizerID.Valid {
		fid := uint64(fertilizerID.Int64)
		d.FertilizerID = &fid
	}
	if fertilizerQuantity.Valid {
		fq := fertilizerQuantity.Float64
		d.FertilizerQuantity = &fq
	}
	if pesticideID.Valid {
		pid := uint64(pesticideID.Int64)
		d.PesticideID = &pid
	}
	if pesticideQuantity.Valid {
		pq := pesticideQuantity.Float64
		d.PesticideQuantity = &pq
	}
	if safeIntervalDays.Valid {
		sid := int(safeIntervalDays.Int64)
		d.SafeIntervalDays = &sid
	}
	if plotCode.Valid {
		d.PlotCode = plotCode.String
	}
	if plotName.Valid {
		d.PlotName = plotName.String
	}
	if operationTypeCode.Valid {
		d.OperationTypeCode = operationTypeCode.String
	}
	if operationTypeName.Valid {
		d.OperationTypeName = operationTypeName.String
	}
	if operationCategory.Valid {
		d.OperationCategory = operationCategory.String
	}
	if operatorName.Valid {
		d.OperatorName = operatorName.String
	}
	if fertilizerName.Valid {
		d.FertilizerName = fertilizerName.String
	}
	if pesticideName.Valid {
		d.PesticideName = pesticideName.String
	}

	return response.Success(c, d)
}

// Create 创建农事记录
// @Summary 创建农事记录
// @Description 新增农事记录，自动生成record_no，格式FR-YYYYMMDD-XXX；如果是打药操作，自动从农药表获取safe_interval_days填充
// @Tags 农事记录
// @Accept json
// @Produce json
// @Param farming_record body models.FarmingRecordCreateRequest true "农事记录信息"
// @Success 200 {object} response.Response{data=map[string]int64}
// @Router /api/farming-records [post]
func (h *FarmingRecordHandler) Create(c echo.Context) error {
	var req models.FarmingRecordCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.PlotID <= 0 {
		return response.BadRequest(c, "地块ID无效")
	}
	if req.OperationTypeID <= 0 {
		return response.BadRequest(c, "操作类型ID无效")
	}
	if req.OperatorID <= 0 {
		return response.BadRequest(c, "操作人ID无效")
	}
	if req.OperationDate == "" {
		return response.BadRequest(c, "操作日期不能为空")
	}

	operationDate, err := time.Parse("2006-01-02", req.OperationDate)
	if err != nil {
		return response.BadRequest(c, "操作日期格式错误，应为YYYY-MM-DD")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	recordNo, err := generateFarmingRecordNo(database)
	if err != nil {
		return response.InternalServerError(c, err.Error())
	}

	isPesticide, err := isPesticideOperation(database, req.OperationTypeID)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	var safeIntervalDays interface{}
	if isPesticide {
		if req.PesticideID == nil || *req.PesticideID <= 0 {
			return response.BadRequest(c, "打药操作必须指定农药ID")
		}
		sid, err := getSafeIntervalDays(database, *req.PesticideID)
		if err != nil {
			return response.BadRequest(c, err.Error())
		}
		safeIntervalDays = sid
	} else {
		safeIntervalDays = nil
	}

	insertSQL := `INSERT INTO farming_records (record_no, plot_id, operation_type_id, operation_date, 
		operator_id, fertilizer_id, fertilizer_quantity, pesticide_id, pesticide_quantity, 
		safe_interval_days, operation_detail, weather_condition, remark) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	result, err := database.Exec(insertSQL, recordNo, req.PlotID, req.OperationTypeID, operationDate,
		req.OperatorID, req.FertilizerID, req.FertilizerQuantity, req.PesticideID, req.PesticideQuantity,
		safeIntervalDays, req.OperationDetail, req.WeatherCondition, req.Remark)
	if err != nil {
		return response.InternalServerError(c, "创建失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	return response.Success(c, map[string]int64{"id": id})
}

// Update 更新农事记录
// @Summary 更新农事记录
// @Description 根据ID更新农事记录信息
// @Tags 农事记录
// @Accept json
// @Produce json
// @Param id path int true "记录ID"
// @Param farming_record body models.FarmingRecordUpdateRequest true "更新的农事记录信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/farming-records/{id} [put]
func (h *FarmingRecordHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req models.FarmingRecordUpdateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var existingCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM farming_records WHERE id = ?", id).Scan(&existingCount); err != nil {
		return response.InternalServerError(c, "检查记录是否存在失败")
	}
	if existingCount == 0 {
		return response.NotFound(c, "农事记录不存在")
	}

	var setClauses []string
	var args []interface{}

	if req.PlotID != nil {
		setClauses = append(setClauses, "plot_id = ?")
		args = append(args, *req.PlotID)
	}
	if req.OperationTypeID != nil {
		setClauses = append(setClauses, "operation_type_id = ?")
		args = append(args, *req.OperationTypeID)
	}
	if req.OperationDate != "" {
		od, err := time.Parse("2006-01-02", req.OperationDate)
		if err != nil {
			return response.BadRequest(c, "操作日期格式错误，应为YYYY-MM-DD")
		}
		setClauses = append(setClauses, "operation_date = ?")
		args = append(args, od)
	}
	if req.OperatorID != nil {
		setClauses = append(setClauses, "operator_id = ?")
		args = append(args, *req.OperatorID)
	}
	if req.FertilizerID != nil {
		setClauses = append(setClauses, "fertilizer_id = ?")
		args = append(args, req.FertilizerID)
	}
	if req.FertilizerQuantity != nil {
		setClauses = append(setClauses, "fertilizer_quantity = ?")
		args = append(args, req.FertilizerQuantity)
	}
	if req.PesticideID != nil {
		setClauses = append(setClauses, "pesticide_id = ?")
		args = append(args, req.PesticideID)

		var currentOperationTypeID uint64
		if req.OperationTypeID != nil {
			currentOperationTypeID = *req.OperationTypeID
		} else {
			querySQL := `SELECT operation_type_id FROM farming_records WHERE id = ?`
			err = database.QueryRow(querySQL, id).Scan(&currentOperationTypeID)
			if err != nil {
				return response.InternalServerError(c, "查询当前操作类型失败")
			}
		}

		isPesticide, err := isPesticideOperation(database, currentOperationTypeID)
		if err == nil && isPesticide {
			sid, err := getSafeIntervalDays(database, *req.PesticideID)
			if err != nil {
				return response.BadRequest(c, err.Error())
			}
			setClauses = append(setClauses, "safe_interval_days = ?")
			args = append(args, sid)
		}
	}
	if req.PesticideQuantity != nil {
		setClauses = append(setClauses, "pesticide_quantity = ?")
		args = append(args, req.PesticideQuantity)
	}
	if req.OperationDetail != "" {
		setClauses = append(setClauses, "operation_detail = ?")
		args = append(args, req.OperationDetail)
	}
	if req.WeatherCondition != "" {
		setClauses = append(setClauses, "weather_condition = ?")
		args = append(args, req.WeatherCondition)
	}
	if req.Remark != "" {
		setClauses = append(setClauses, "remark = ?")
		args = append(args, req.Remark)
	}

	if len(setClauses) == 0 {
		return response.BadRequest(c, "没有需要更新的字段")
	}

	args = append(args, id)
	updateSQL := "UPDATE farming_records SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "农事记录不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除农事记录
// @Summary 删除农事记录
// @Description 根据ID删除农事记录
// @Tags 农事记录
// @Accept json
// @Produce json
// @Param id path int true "记录ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/farming-records/{id} [delete]
func (h *FarmingRecordHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	deleteSQL := "DELETE FROM farming_records WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "农事记录不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}
