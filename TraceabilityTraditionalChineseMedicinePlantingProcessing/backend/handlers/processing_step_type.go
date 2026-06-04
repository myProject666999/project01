package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"tcm-traceability/models"
	"tcm-traceability/pkg/db"
	"tcm-traceability/pkg/response"

	"github.com/labstack/echo/v4"
)

type ProcessingStepTypeHandler struct{}

func NewProcessingStepTypeHandler() *ProcessingStepTypeHandler {
	return &ProcessingStepTypeHandler{}
}

// GetList 分页查询加工工序类型列表
// @Summary 分页查询加工工序类型列表
// @Description 根据条件分页查询加工工序类型
// @Tags 加工工序类型
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param code query string false "工序编码（精确查询）"
// @Param name query string false "工序名称（模糊查询）"
// @Param category query string false "分类：cleaning/cutting/processing/drying/packaging/other"
// @Param status query int false "状态：1-启用 0-禁用"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.ProcessingStepType}}
// @Router /api/processing-step-types [get]
func (h *ProcessingStepTypeHandler) GetList(c echo.Context) error {
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

	code := c.QueryParam("code")
	name := c.QueryParam("name")
	category := c.QueryParam("category")
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

	if code != "" {
		whereClauses = append(whereClauses, "code = ?")
		args = append(args, code)
	}
	if name != "" {
		whereClauses = append(whereClauses, "name LIKE ?")
		args = append(args, "%"+name+"%")
	}
	if category != "" {
		whereClauses = append(whereClauses, "category = ?")
		args = append(args, category)
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

	countSQL := "SELECT COUNT(*) FROM processing_step_types" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, code, name, category, need_temperature, need_time, 
		standard_temperature_min, standard_temperature_max, standard_time_min, standard_time_max, 
		description, sort_order, status, created_at 
		FROM processing_step_types` + whereSQL + ` ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var types []models.ProcessingStepType
	for rows.Next() {
		var t models.ProcessingStepType
		if err := rows.Scan(&t.ID, &t.Code, &t.Name, &t.Category, &t.NeedTemperature, &t.NeedTime,
			&t.StandardTemperatureMin, &t.StandardTemperatureMax, &t.StandardTimeMin, &t.StandardTimeMax,
			&t.Description, &t.SortOrder, &t.Status, &t.CreatedAt); err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}
		types = append(types, t)
	}

	if types == nil {
		types = []models.ProcessingStepType{}
	}

	return response.SuccessWithPaginated(c, types, total, page, pageSize)
}

// GetByID 根据ID获取加工工序类型详情
// @Summary 获取加工工序类型详情
// @Description 根据ID获取加工工序类型详细信息
// @Tags 加工工序类型
// @Accept json
// @Produce json
// @Param id path int true "工序类型ID"
// @Success 200 {object} response.Response{data=models.ProcessingStepType}
// @Router /api/processing-step-types/{id} [get]
func (h *ProcessingStepTypeHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var t models.ProcessingStepType
	querySQL := `SELECT id, code, name, category, need_temperature, need_time, 
		standard_temperature_min, standard_temperature_max, standard_time_min, standard_time_max, 
		description, sort_order, status, created_at 
		FROM processing_step_types WHERE id = ?`
	err = database.QueryRow(querySQL, id).Scan(&t.ID, &t.Code, &t.Name, &t.Category, &t.NeedTemperature, &t.NeedTime,
		&t.StandardTemperatureMin, &t.StandardTemperatureMax, &t.StandardTimeMin, &t.StandardTimeMax,
		&t.Description, &t.SortOrder, &t.Status, &t.CreatedAt)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "加工工序类型不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	return response.Success(c, t)
}

// Create 创建加工工序类型
// @Summary 创建加工工序类型
// @Description 新增加工工序类型信息
// @Tags 加工工序类型
// @Accept json
// @Produce json
// @Param processing_step_type body models.ProcessingStepTypeCreateRequest true "加工工序类型信息"
// @Success 200 {object} response.Response{data=map[string]int64}
// @Router /api/processing-step-types [post]
func (h *ProcessingStepTypeHandler) Create(c echo.Context) error {
	var req models.ProcessingStepTypeCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.Code == "" {
		return response.BadRequest(c, "工序编码不能为空")
	}
	if req.Name == "" {
		return response.BadRequest(c, "工序名称不能为空")
	}
	if req.Category == "" {
		return response.BadRequest(c, "分类不能为空")
	}
	validCategories := map[string]bool{
		"cleaning": true, "cutting": true, "processing": true,
		"drying": true, "packaging": true, "other": true,
	}
	if !validCategories[req.Category] {
		return response.BadRequest(c, "分类值无效，只能是cleaning/cutting/processing/drying/packaging/other")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var existingCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM processing_step_types WHERE code = ?", req.Code).Scan(&existingCount); err != nil {
		return response.InternalServerError(c, "检查编码重复失败")
	}
	if existingCount > 0 {
		return response.BadRequest(c, "工序编码已存在")
	}

	insertSQL := `INSERT INTO processing_step_types (code, name, category, need_temperature, need_time, 
		standard_temperature_min, standard_temperature_max, standard_time_min, standard_time_max, 
		description, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	status := req.Status
	if status == 0 {
		status = 1
	}
	result, err := database.Exec(insertSQL, req.Code, req.Name, req.Category, req.NeedTemperature, req.NeedTime,
		req.StandardTemperatureMin, req.StandardTemperatureMax, req.StandardTimeMin, req.StandardTimeMax,
		req.Description, req.SortOrder, status)
	if err != nil {
		return response.InternalServerError(c, "创建失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	return response.Success(c, map[string]int64{"id": id})
}

// Update 更新加工工序类型
// @Summary 更新加工工序类型
// @Description 根据ID更新加工工序类型信息
// @Tags 加工工序类型
// @Accept json
// @Produce json
// @Param id path int true "工序类型ID"
// @Param processing_step_type body models.ProcessingStepTypeUpdateRequest true "更新的加工工序类型信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/processing-step-types/{id} [put]
func (h *ProcessingStepTypeHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req models.ProcessingStepTypeUpdateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.Category != "" {
		validCategories := map[string]bool{
			"cleaning": true, "cutting": true, "processing": true,
			"drying": true, "packaging": true, "other": true,
		}
		if !validCategories[req.Category] {
			return response.BadRequest(c, "分类值无效，只能是cleaning/cutting/processing/drying/packaging/other")
		}
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	if req.Code != "" {
		var existingCount int
		if err := database.QueryRow("SELECT COUNT(*) FROM processing_step_types WHERE code = ? AND id != ?", req.Code, id).Scan(&existingCount); err != nil {
			return response.InternalServerError(c, "检查编码重复失败")
		}
		if existingCount > 0 {
			return response.BadRequest(c, "工序编码已存在")
		}
	}

	var setClauses []string
	var args []interface{}

	if req.Code != "" {
		setClauses = append(setClauses, "code = ?")
		args = append(args, req.Code)
	}
	if req.Name != "" {
		setClauses = append(setClauses, "name = ?")
		args = append(args, req.Name)
	}
	if req.Category != "" {
		setClauses = append(setClauses, "category = ?")
		args = append(args, req.Category)
	}
	if req.NeedTemperature != 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "need_temperature = ?")
		args = append(args, req.NeedTemperature)
	}
	if req.NeedTime != 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "need_time = ?")
		args = append(args, req.NeedTime)
	}
	if req.StandardTemperatureMin != nil || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "standard_temperature_min = ?")
		args = append(args, req.StandardTemperatureMin)
	}
	if req.StandardTemperatureMax != nil || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "standard_temperature_max = ?")
		args = append(args, req.StandardTemperatureMax)
	}
	if req.StandardTimeMin != nil || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "standard_time_min = ?")
		args = append(args, req.StandardTimeMin)
	}
	if req.StandardTimeMax != nil || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "standard_time_max = ?")
		args = append(args, req.StandardTimeMax)
	}
	if req.Description != "" {
		setClauses = append(setClauses, "description = ?")
		args = append(args, req.Description)
	}
	if req.SortOrder != 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "sort_order = ?")
		args = append(args, req.SortOrder)
	}
	if req.Status != 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "status = ?")
		args = append(args, req.Status)
	}

	if len(setClauses) == 0 {
		return response.BadRequest(c, "没有需要更新的字段")
	}

	args = append(args, id)
	updateSQL := "UPDATE processing_step_types SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "加工工序类型不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除加工工序类型
// @Summary 删除加工工序类型
// @Description 根据ID删除加工工序类型
// @Tags 加工工序类型
// @Accept json
// @Produce json
// @Param id path int true "工序类型ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/processing-step-types/{id} [delete]
func (h *ProcessingStepTypeHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var recordCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM processing_records WHERE step_type_id = ?", id).Scan(&recordCount); err != nil {
		return response.InternalServerError(c, "检查关联数据失败")
	}
	if recordCount > 0 {
		return response.BadRequest(c, "该工序类型已被加工记录使用，无法删除")
	}

	deleteSQL := "DELETE FROM processing_step_types WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "加工工序类型不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}
