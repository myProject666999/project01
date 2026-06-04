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

type FarmingOperationTypeHandler struct{}

func NewFarmingOperationTypeHandler() *FarmingOperationTypeHandler {
	return &FarmingOperationTypeHandler{}
}

// GetList 分页查询农事操作类型列表
// @Summary 分页查询农事操作类型列表
// @Description 根据条件分页查询农事操作类型
// @Tags 农事操作类型
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param code query string false "操作编码（精确查询）"
// @Param name query string false "操作名称（模糊查询）"
// @Param category query string false "分类：weeding/fertilizing/pesticide/watering/pruning/other"
// @Param status query int false "状态：1-启用 0-禁用"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.FarmingOperationType}}
// @Router /api/farming-operation-types [get]
func (h *FarmingOperationTypeHandler) GetList(c echo.Context) error {
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

	countSQL := "SELECT COUNT(*) FROM farming_operation_types" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, code, name, category, need_record_detail, description, 
		sort_order, status, created_at 
		FROM farming_operation_types` + whereSQL + ` ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var types []models.FarmingOperationType
	for rows.Next() {
		var t models.FarmingOperationType
		if err := rows.Scan(&t.ID, &t.Code, &t.Name, &t.Category, &t.NeedRecordDetail,
			&t.Description, &t.SortOrder, &t.Status, &t.CreatedAt); err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}
		types = append(types, t)
	}

	if types == nil {
		types = []models.FarmingOperationType{}
	}

	return response.SuccessWithPaginated(c, types, total, page, pageSize)
}

// GetByID 根据ID获取农事操作类型详情
// @Summary 获取农事操作类型详情
// @Description 根据ID获取农事操作类型详细信息
// @Tags 农事操作类型
// @Accept json
// @Produce json
// @Param id path int true "操作类型ID"
// @Success 200 {object} response.Response{data=models.FarmingOperationType}
// @Router /api/farming-operation-types/{id} [get]
func (h *FarmingOperationTypeHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var t models.FarmingOperationType
	querySQL := `SELECT id, code, name, category, need_record_detail, description, 
		sort_order, status, created_at 
		FROM farming_operation_types WHERE id = ?`
	err = database.QueryRow(querySQL, id).Scan(&t.ID, &t.Code, &t.Name, &t.Category, &t.NeedRecordDetail,
		&t.Description, &t.SortOrder, &t.Status, &t.CreatedAt)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "农事操作类型不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	return response.Success(c, t)
}

// Create 创建农事操作类型
// @Summary 创建农事操作类型
// @Description 新增农事操作类型信息
// @Tags 农事操作类型
// @Accept json
// @Produce json
// @Param farming_operation_type body models.FarmingOperationTypeCreateRequest true "农事操作类型信息"
// @Success 200 {object} response.Response{data=map[string]int64}
// @Router /api/farming-operation-types [post]
func (h *FarmingOperationTypeHandler) Create(c echo.Context) error {
	var req models.FarmingOperationTypeCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.Code == "" {
		return response.BadRequest(c, "操作编码不能为空")
	}
	if req.Name == "" {
		return response.BadRequest(c, "操作名称不能为空")
	}
	if req.Category == "" {
		return response.BadRequest(c, "分类不能为空")
	}
	validCategories := map[string]bool{
		"weeding": true, "fertilizing": true, "pesticide": true,
		"watering": true, "pruning": true, "other": true,
	}
	if !validCategories[req.Category] {
		return response.BadRequest(c, "分类值无效，只能是weeding/fertilizing/pesticide/watering/pruning/other")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var existingCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM farming_operation_types WHERE code = ?", req.Code).Scan(&existingCount); err != nil {
		return response.InternalServerError(c, "检查编码重复失败")
	}
	if existingCount > 0 {
		return response.BadRequest(c, "操作编码已存在")
	}

	insertSQL := `INSERT INTO farming_operation_types (code, name, category, need_record_detail, 
		description, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?)`
	status := req.Status
	if status == 0 {
		status = 1
	}
	result, err := database.Exec(insertSQL, req.Code, req.Name, req.Category, req.NeedRecordDetail,
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

// Update 更新农事操作类型
// @Summary 更新农事操作类型
// @Description 根据ID更新农事操作类型信息
// @Tags 农事操作类型
// @Accept json
// @Produce json
// @Param id path int true "操作类型ID"
// @Param farming_operation_type body models.FarmingOperationTypeUpdateRequest true "更新的农事操作类型信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/farming-operation-types/{id} [put]
func (h *FarmingOperationTypeHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req models.FarmingOperationTypeUpdateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.Category != "" {
		validCategories := map[string]bool{
			"weeding": true, "fertilizing": true, "pesticide": true,
			"watering": true, "pruning": true, "other": true,
		}
		if !validCategories[req.Category] {
			return response.BadRequest(c, "分类值无效，只能是weeding/fertilizing/pesticide/watering/pruning/other")
		}
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	if req.Code != "" {
		var existingCount int
		if err := database.QueryRow("SELECT COUNT(*) FROM farming_operation_types WHERE code = ? AND id != ?", req.Code, id).Scan(&existingCount); err != nil {
			return response.InternalServerError(c, "检查编码重复失败")
		}
		if existingCount > 0 {
			return response.BadRequest(c, "操作编码已存在")
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
	if req.NeedRecordDetail != 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "need_record_detail = ?")
		args = append(args, req.NeedRecordDetail)
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
	updateSQL := "UPDATE farming_operation_types SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "农事操作类型不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除农事操作类型
// @Summary 删除农事操作类型
// @Description 根据ID删除农事操作类型
// @Tags 农事操作类型
// @Accept json
// @Produce json
// @Param id path int true "操作类型ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/farming-operation-types/{id} [delete]
func (h *FarmingOperationTypeHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var recordCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM farming_records WHERE operation_type_id = ?", id).Scan(&recordCount); err != nil {
		return response.InternalServerError(c, "检查关联数据失败")
	}
	if recordCount > 0 {
		return response.BadRequest(c, "该操作类型已被农事记录使用，无法删除")
	}

	deleteSQL := "DELETE FROM farming_operation_types WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "农事操作类型不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}
