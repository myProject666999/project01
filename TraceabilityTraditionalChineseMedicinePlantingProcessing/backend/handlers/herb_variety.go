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

type HerbVarietyHandler struct{}

func NewHerbVarietyHandler() *HerbVarietyHandler {
	return &HerbVarietyHandler{}
}

// GetList 分页查询中药材品种列表
// @Summary 分页查询中药材品种列表
// @Description 根据条件分页查询中药材品种
// @Tags 中药材品种
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param code query string false "品种编码（精确查询）"
// @Param name query string false "品种名称（模糊查询）"
// @Param origin query string false "道地产区（模糊查询）"
// @Param status query int false "状态：1-启用 0-禁用"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.HerbVariety}}
// @Router /api/herb-varieties [get]
func (h *HerbVarietyHandler) GetList(c echo.Context) error {
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
	origin := c.QueryParam("origin")
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
	if origin != "" {
		whereClauses = append(whereClauses, "origin LIKE ?")
		args = append(args, "%"+origin+"%")
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

	countSQL := "SELECT COUNT(*) FROM herb_varieties" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, code, name, alias, scientific_name, origin, growth_cycle_days, 
		description, status, created_at, updated_at 
		FROM herb_varieties` + whereSQL + ` ORDER BY id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var varieties []models.HerbVariety
	for rows.Next() {
		var v models.HerbVariety
		if err := rows.Scan(&v.ID, &v.Code, &v.Name, &v.Alias, &v.ScientificName,
			&v.Origin, &v.GrowthCycleDays, &v.Description, &v.Status, &v.CreatedAt, &v.UpdatedAt); err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}
		varieties = append(varieties, v)
	}

	if varieties == nil {
		varieties = []models.HerbVariety{}
	}

	return response.SuccessWithPaginated(c, varieties, total, page, pageSize)
}

// GetByID 根据ID获取中药材品种详情
// @Summary 获取中药材品种详情
// @Description 根据ID获取中药材品种详细信息
// @Tags 中药材品种
// @Accept json
// @Produce json
// @Param id path int true "品种ID"
// @Success 200 {object} response.Response{data=models.HerbVariety}
// @Router /api/herb-varieties/{id} [get]
func (h *HerbVarietyHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var v models.HerbVariety
	querySQL := `SELECT id, code, name, alias, scientific_name, origin, growth_cycle_days, 
		description, status, created_at, updated_at 
		FROM herb_varieties WHERE id = ?`
	err = database.QueryRow(querySQL, id).Scan(&v.ID, &v.Code, &v.Name, &v.Alias, &v.ScientificName,
		&v.Origin, &v.GrowthCycleDays, &v.Description, &v.Status, &v.CreatedAt, &v.UpdatedAt)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "中药材品种不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	return response.Success(c, v)
}

// Create 创建中药材品种
// @Summary 创建中药材品种
// @Description 新增中药材品种信息
// @Tags 中药材品种
// @Accept json
// @Produce json
// @Param herb_variety body models.HerbVarietyCreateRequest true "中药材品种信息"
// @Success 200 {object} response.Response{data=map[string]int64}
// @Router /api/herb-varieties [post]
func (h *HerbVarietyHandler) Create(c echo.Context) error {
	var req models.HerbVarietyCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.Code == "" {
		return response.BadRequest(c, "品种编码不能为空")
	}
	if req.Name == "" {
		return response.BadRequest(c, "品种名称不能为空")
	}
	if req.GrowthCycleDays < 0 {
		return response.BadRequest(c, "生长周期不能为负数")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var existingCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM herb_varieties WHERE code = ?", req.Code).Scan(&existingCount); err != nil {
		return response.InternalServerError(c, "检查编码重复失败")
	}
	if existingCount > 0 {
		return response.BadRequest(c, "品种编码已存在")
	}

	insertSQL := `INSERT INTO herb_varieties (code, name, alias, scientific_name, origin, 
		growth_cycle_days, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	status := req.Status
	if status == 0 {
		status = 1
	}
	result, err := database.Exec(insertSQL, req.Code, req.Name, req.Alias, req.ScientificName,
		req.Origin, req.GrowthCycleDays, req.Description, status)
	if err != nil {
		return response.InternalServerError(c, "创建失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	return response.Success(c, map[string]int64{"id": id})
}

// Update 更新中药材品种
// @Summary 更新中药材品种
// @Description 根据ID更新中药材品种信息
// @Tags 中药材品种
// @Accept json
// @Produce json
// @Param id path int true "品种ID"
// @Param herb_variety body models.HerbVarietyUpdateRequest true "更新的中药材品种信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/herb-varieties/{id} [put]
func (h *HerbVarietyHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req models.HerbVarietyUpdateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.GrowthCycleDays < 0 {
		return response.BadRequest(c, "生长周期不能为负数")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	if req.Code != "" {
		var existingCount int
		if err := database.QueryRow("SELECT COUNT(*) FROM herb_varieties WHERE code = ? AND id != ?", req.Code, id).Scan(&existingCount); err != nil {
			return response.InternalServerError(c, "检查编码重复失败")
		}
		if existingCount > 0 {
			return response.BadRequest(c, "品种编码已存在")
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
	if req.Alias != "" {
		setClauses = append(setClauses, "alias = ?")
		args = append(args, req.Alias)
	}
	if req.ScientificName != "" {
		setClauses = append(setClauses, "scientific_name = ?")
		args = append(args, req.ScientificName)
	}
	if req.Origin != "" {
		setClauses = append(setClauses, "origin = ?")
		args = append(args, req.Origin)
	}
	if req.GrowthCycleDays > 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "growth_cycle_days = ?")
		args = append(args, req.GrowthCycleDays)
	}
	if req.Description != "" {
		setClauses = append(setClauses, "description = ?")
		args = append(args, req.Description)
	}
	if req.Status != 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "status = ?")
		args = append(args, req.Status)
	}

	if len(setClauses) == 0 {
		return response.BadRequest(c, "没有需要更新的字段")
	}

	args = append(args, id)
	updateSQL := "UPDATE herb_varieties SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "中药材品种不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除中药材品种
// @Summary 删除中药材品种
// @Description 根据ID删除中药材品种
// @Tags 中药材品种
// @Accept json
// @Produce json
// @Param id path int true "品种ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/herb-varieties/{id} [delete]
func (h *HerbVarietyHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var plotCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM plots WHERE variety_id = ?", id).Scan(&plotCount); err != nil {
		return response.InternalServerError(c, "检查关联数据失败")
	}
	if plotCount > 0 {
		return response.BadRequest(c, "该品种已被地块使用，无法删除")
	}

	deleteSQL := "DELETE FROM herb_varieties WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "中药材品种不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}
