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

type ProcessingRecordHandler struct{}

func NewProcessingRecordHandler() *ProcessingRecordHandler {
	return &ProcessingRecordHandler{}
}

// generateRecordNo 生成加工记录编号，格式：PR-YYYYMMDD-XXX
func generateProcessingRecordNo(database *sql.DB) (string, error) {
	now := time.Now()
	prefix := fmt.Sprintf("PR-%s-", now.Format("20060102"))

	var maxSuffix int
	querySQL := `SELECT COALESCE(MAX(CAST(SUBSTRING(record_no, ?) AS UNSIGNED)), 0) 
		FROM processing_records WHERE record_no LIKE ?`
	prefixLen := len(prefix) + 1
	err := database.QueryRow(querySQL, prefixLen, prefix+"%").Scan(&maxSuffix)
	if err != nil {
		return "", fmt.Errorf("生成加工记录编号失败: %w", err)
	}

	suffix := maxSuffix + 1
	recordNo := fmt.Sprintf("%s%03d", prefix, suffix)

	var exists int
	checkSQL := `SELECT COUNT(*) FROM processing_records WHERE record_no = ?`
	for {
		err = database.QueryRow(checkSQL, recordNo).Scan(&exists)
		if err != nil {
			return "", fmt.Errorf("检查加工记录编号重复失败: %w", err)
		}
		if exists == 0 {
			break
		}
		suffix++
		recordNo = fmt.Sprintf("%s%03d", prefix, suffix)
	}

	return recordNo, nil
}

// calculateDuration 计算加工时长（分钟）
func calculateDuration(startTime, endTime time.Time) int {
	duration := endTime.Sub(startTime)
	return int(duration.Minutes())
}

// GetList 分页查询加工记录列表
// @Summary 分页查询加工记录列表
// @Description 根据条件分页查询加工记录，支持按批次、工序类型、操作人筛选
// @Tags 加工记录
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param batch_id query int false "采收批次ID"
// @Param step_type_id query int false "工序类型ID"
// @Param operator_id query int false "操作人ID"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.ProcessingRecord}}
// @Router /api/processing-records [get]
func (h *ProcessingRecordHandler) GetList(c echo.Context) error {
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

	batchIDStr := c.QueryParam("batch_id")
	stepTypeIDStr := c.QueryParam("step_type_id")
	operatorIDStr := c.QueryParam("operator_id")

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

	if batchIDStr != "" {
		batchID, _ := strconv.ParseUint(batchIDStr, 10, 64)
		whereClauses = append(whereClauses, "batch_id = ?")
		args = append(args, batchID)
	}
	if stepTypeIDStr != "" {
		stepTypeID, _ := strconv.ParseUint(stepTypeIDStr, 10, 64)
		whereClauses = append(whereClauses, "step_type_id = ?")
		args = append(args, stepTypeID)
	}
	if operatorIDStr != "" {
		operatorID, _ := strconv.ParseUint(operatorIDStr, 10, 64)
		whereClauses = append(whereClauses, "operator_id = ?")
		args = append(args, operatorID)
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	countSQL := "SELECT COUNT(*) FROM processing_records" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, record_no, batch_id, step_type_id, start_time, end_time, 
		duration_minutes, temperature, operator_id, processing_detail, input_quantity, 
		output_quantity, quality_check_result, quality_check_remark, remark, created_at, updated_at 
		FROM processing_records` + whereSQL + ` ORDER BY start_time DESC, id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var records []models.ProcessingRecord
	for rows.Next() {
		var r models.ProcessingRecord
		var endTime sql.NullTime
		var durationMinutes sql.NullInt64
		var temperatureFloat sql.NullFloat64
		var inputQuantity, outputQuantity sql.NullFloat64

		err := rows.Scan(&r.ID, &r.RecordNo, &r.BatchID, &r.StepTypeID, &r.StartTime,
			&endTime, &durationMinutes, &temperatureFloat, &r.OperatorID, &r.ProcessingDetail,
			&inputQuantity, &outputQuantity, &r.QualityCheckResult, &r.QualityCheckRemark,
			&r.Remark, &r.CreatedAt, &r.UpdatedAt)
		if err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}

		if endTime.Valid {
			r.EndTime = &endTime.Time
		}
		if durationMinutes.Valid {
			dm := int(durationMinutes.Int64)
			r.DurationMinutes = &dm
		}
		if temperatureFloat.Valid {
			tf := temperatureFloat.Float64
			r.Temperature = &tf
		}
		if inputQuantity.Valid {
			iq := inputQuantity.Float64
			r.InputQuantity = &iq
		}
		if outputQuantity.Valid {
			oq := outputQuantity.Float64
			r.OutputQuantity = &oq
		}

		records = append(records, r)
	}

	if records == nil {
		records = []models.ProcessingRecord{}
	}

	return response.SuccessWithPaginated(c, records, total, page, pageSize)
}

// GetByID 根据ID获取加工记录详情
// @Summary 获取加工记录详情
// @Description 根据ID获取加工记录详细信息，包含关联的批次、工序类型、操作人信息
// @Tags 加工记录
// @Accept json
// @Produce json
// @Param id path int true "记录ID"
// @Success 200 {object} response.Response{data=models.ProcessingRecordDetail}
// @Router /api/processing-records/{id} [get]
func (h *ProcessingRecordHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var d models.ProcessingRecordDetail
	querySQL := `SELECT pr.id, pr.record_no, pr.batch_id, pr.step_type_id, pr.start_time, 
		pr.end_time, pr.duration_minutes, pr.temperature, pr.operator_id, pr.processing_detail, 
		pr.input_quantity, pr.output_quantity, pr.quality_check_result, pr.quality_check_remark, 
		pr.remark, pr.created_at, pr.updated_at, hb.batch_no, pst.code AS step_type_code, 
		pst.name AS step_type_name, pst.category AS step_type_category, op.name AS operator_name 
		FROM processing_records pr 
		LEFT JOIN harvest_batches hb ON pr.batch_id = hb.id 
		LEFT JOIN processing_step_types pst ON pr.step_type_id = pst.id 
		LEFT JOIN operators op ON pr.operator_id = op.id 
		WHERE pr.id = ?`

	var endTime sql.NullTime
	var durationMinutes sql.NullInt64
	var temperature sql.NullFloat64
	var inputQuantity, outputQuantity sql.NullFloat64
	var batchNo, stepTypeCode, stepTypeName, stepTypeCategory, operatorName sql.NullString

	err = database.QueryRow(querySQL, id).Scan(&d.ID, &d.RecordNo, &d.BatchID, &d.StepTypeID,
		&d.StartTime, &endTime, &durationMinutes, &temperature, &d.OperatorID, &d.ProcessingDetail,
		&inputQuantity, &outputQuantity, &d.QualityCheckResult, &d.QualityCheckRemark, &d.Remark,
		&d.CreatedAt, &d.UpdatedAt, &batchNo, &stepTypeCode, &stepTypeName, &stepTypeCategory, &operatorName)

	if err == sql.ErrNoRows {
		return response.NotFound(c, "加工记录不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	if endTime.Valid {
		d.EndTime = &endTime.Time
	}
	if durationMinutes.Valid {
		dm := int(durationMinutes.Int64)
		d.DurationMinutes = &dm
	}
	if temperature.Valid {
		tf := temperature.Float64
		d.Temperature = &tf
	}
	if inputQuantity.Valid {
		iq := inputQuantity.Float64
		d.InputQuantity = &iq
	}
	if outputQuantity.Valid {
		oq := outputQuantity.Float64
		d.OutputQuantity = &oq
	}
	if batchNo.Valid {
		d.BatchNo = batchNo.String
	}
	if stepTypeCode.Valid {
		d.StepTypeCode = stepTypeCode.String
	}
	if stepTypeName.Valid {
		d.StepTypeName = stepTypeName.String
	}
	if stepTypeCategory.Valid {
		d.StepTypeCategory = stepTypeCategory.String
	}
	if operatorName.Valid {
		d.OperatorName = operatorName.String
	}

	return response.Success(c, d)
}

// Create 创建加工记录
// @Summary 创建加工记录
// @Description 新增加工记录，自动生成record_no，格式PR-YYYYMMDD-XXX；自动计算duration_minutes
// @Tags 加工记录
// @Accept json
// @Produce json
// @Param processing_record body models.ProcessingRecordCreateRequest true "加工记录信息"
// @Success 200 {object} response.Response{data=map[string]int64}
// @Router /api/processing-records [post]
func (h *ProcessingRecordHandler) Create(c echo.Context) error {
	var req models.ProcessingRecordCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.BatchID <= 0 {
		return response.BadRequest(c, "批次ID无效")
	}
	if req.StepTypeID <= 0 {
		return response.BadRequest(c, "工序类型ID无效")
	}
	if req.OperatorID <= 0 {
		return response.BadRequest(c, "操作人ID无效")
	}
	if req.StartTime == "" {
		return response.BadRequest(c, "开始时间不能为空")
	}

	startTime, err := time.Parse("2006-01-02 15:04:05", req.StartTime)
	if err != nil {
		startTime, err = time.Parse(time.RFC3339, req.StartTime)
		if err != nil {
			return response.BadRequest(c, "开始时间格式错误，应为YYYY-MM-DD HH:MM:SS或RFC3339格式")
		}
	}

	var endTime interface{}
	var durationMinutes interface{}
	if req.EndTime != "" {
		et, err := time.Parse("2006-01-02 15:04:05", req.EndTime)
		if err != nil {
			et, err = time.Parse(time.RFC3339, req.EndTime)
			if err != nil {
				return response.BadRequest(c, "结束时间格式错误，应为YYYY-MM-DD HH:MM:SS或RFC3339格式")
			}
		}
		if et.Before(startTime) {
			return response.BadRequest(c, "结束时间不能早于开始时间")
		}
		endTime = et
		dm := calculateDuration(startTime, et)
		durationMinutes = dm
	} else {
		endTime = nil
		durationMinutes = nil
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	recordNo, err := generateProcessingRecordNo(database)
	if err != nil {
		return response.InternalServerError(c, err.Error())
	}

	insertSQL := `INSERT INTO processing_records (record_no, batch_id, step_type_id, start_time, 
		end_time, duration_minutes, temperature, operator_id, processing_detail, input_quantity, 
		output_quantity, quality_check_result, quality_check_remark, remark) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	result, err := database.Exec(insertSQL, recordNo, req.BatchID, req.StepTypeID, startTime,
		endTime, durationMinutes, req.Temperature, req.OperatorID, req.ProcessingDetail,
		req.InputQuantity, req.OutputQuantity, req.QualityCheckResult, req.QualityCheckRemark, req.Remark)
	if err != nil {
		return response.InternalServerError(c, "创建失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	return response.Success(c, map[string]int64{"id": id})
}

// Update 更新加工记录
// @Summary 更新加工记录
// @Description 根据ID更新加工记录信息
// @Tags 加工记录
// @Accept json
// @Produce json
// @Param id path int true "记录ID"
// @Param processing_record body models.ProcessingRecordUpdateRequest true "更新的加工记录信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/processing-records/{id} [put]
func (h *ProcessingRecordHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req models.ProcessingRecordUpdateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var existingCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM processing_records WHERE id = ?", id).Scan(&existingCount); err != nil {
		return response.InternalServerError(c, "检查记录是否存在失败")
	}
	if existingCount == 0 {
		return response.NotFound(c, "加工记录不存在")
	}

	var setClauses []string
	var args []interface{}

	if req.BatchID != nil {
		setClauses = append(setClauses, "batch_id = ?")
		args = append(args, *req.BatchID)
	}
	if req.StepTypeID != nil {
		setClauses = append(setClauses, "step_type_id = ?")
		args = append(args, *req.StepTypeID)
	}
	if req.StartTime != "" || req.EndTime != "" {
		var currentStartTime, currentEndTimeStr sql.NullString
		querySQL := `SELECT DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s'), 
			DATE_FORMAT(end_time, '%Y-%m-%d %H:%i:%s') FROM processing_records WHERE id = ?`
		err = database.QueryRow(querySQL, id).Scan(&currentStartTime, &currentEndTimeStr)
		if err != nil {
			return response.InternalServerError(c, "查询当前时间信息失败")
		}

		startTimeStr := currentStartTime.String
		if req.StartTime != "" {
			startTimeStr = req.StartTime
		}

		st, err := time.Parse("2006-01-02 15:04:05", startTimeStr)
		if err != nil {
			st, err = time.Parse(time.RFC3339, startTimeStr)
			if err != nil {
				return response.BadRequest(c, "开始时间格式错误")
			}
		}

		if req.StartTime != "" {
			setClauses = append(setClauses, "start_time = ?")
			args = append(args, st)
		}

		if req.EndTime != "" {
			et, err := time.Parse("2006-01-02 15:04:05", req.EndTime)
			if err != nil {
				et, err = time.Parse(time.RFC3339, req.EndTime)
				if err != nil {
					return response.BadRequest(c, "结束时间格式错误")
				}
			}
			if et.Before(st) {
				return response.BadRequest(c, "结束时间不能早于开始时间")
			}
			setClauses = append(setClauses, "end_time = ?")
			args = append(args, et)

			dm := calculateDuration(st, et)
			setClauses = append(setClauses, "duration_minutes = ?")
			args = append(args, dm)
		}
	}
	if req.Temperature != nil {
		setClauses = append(setClauses, "temperature = ?")
		args = append(args, req.Temperature)
	}
	if req.OperatorID != nil {
		setClauses = append(setClauses, "operator_id = ?")
		args = append(args, *req.OperatorID)
	}
	if req.ProcessingDetail != "" {
		setClauses = append(setClauses, "processing_detail = ?")
		args = append(args, req.ProcessingDetail)
	}
	if req.InputQuantity != nil {
		setClauses = append(setClauses, "input_quantity = ?")
		args = append(args, req.InputQuantity)
	}
	if req.OutputQuantity != nil {
		setClauses = append(setClauses, "output_quantity = ?")
		args = append(args, req.OutputQuantity)
	}
	if req.QualityCheckResult != "" {
		setClauses = append(setClauses, "quality_check_result = ?")
		args = append(args, req.QualityCheckResult)
	}
	if req.QualityCheckRemark != "" {
		setClauses = append(setClauses, "quality_check_remark = ?")
		args = append(args, req.QualityCheckRemark)
	}
	if req.Remark != "" {
		setClauses = append(setClauses, "remark = ?")
		args = append(args, req.Remark)
	}

	if len(setClauses) == 0 {
		return response.BadRequest(c, "没有需要更新的字段")
	}

	args = append(args, id)
	updateSQL := "UPDATE processing_records SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "加工记录不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除加工记录
// @Summary 删除加工记录
// @Description 根据ID删除加工记录
// @Tags 加工记录
// @Accept json
// @Produce json
// @Param id path int true "记录ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/processing-records/{id} [delete]
func (h *ProcessingRecordHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	deleteSQL := "DELETE FROM processing_records WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "加工记录不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}
