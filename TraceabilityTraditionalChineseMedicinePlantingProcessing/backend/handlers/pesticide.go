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

type PesticideHandler struct{}

func NewPesticideHandler() *PesticideHandler {
	return &PesticideHandler{}
}

// GetList 分页查询农药列表
// @Summary 分页查询农药列表
// @Description 根据条件分页查询农药
// @Tags 农药管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param name query string false "农药名称（模糊查询）"
// @Param manufacturer query string false "生产厂家（模糊查询）"
// @Param status query int false "状态：1-启用 0-禁用"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.Pesticide}}
// @Router /api/pesticides [get]
func (h *PesticideHandler) GetList(c echo.Context) error {
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

	name := c.QueryParam("name")
	manufacturer := c.QueryParam("manufacturer")
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

	if name != "" {
		whereClauses = append(whereClauses, "name LIKE ?")
		args = append(args, "%"+name+"%")
	}
	if manufacturer != "" {
		whereClauses = append(whereClauses, "manufacturer LIKE ?")
		args = append(args, "%"+manufacturer+"%")
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

	countSQL := "SELECT COUNT(*) FROM pesticides" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, name, registration_no, manufacturer, safe_interval_days, 
		usage_method, status, created_at, updated_at 
		FROM pesticides` + whereSQL + ` ORDER BY id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var pesticides []models.Pesticide
	for rows.Next() {
		var p models.Pesticide
		if err := rows.Scan(&p.ID, &p.Name, &p.RegistrationNo, &p.Manufacturer,
			&p.SafeIntervalDays, &p.UsageMethod, &p.Status, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}
		pesticides = append(pesticides, p)
	}

	if pesticides == nil {
		pesticides = []models.Pesticide{}
	}

	return response.SuccessWithPaginated(c, pesticides, total, page, pageSize)
}

// GetByID 根据ID获取农药详情
// @Summary 获取农药详情
// @Description 根据ID获取农药详细信息
// @Tags 农药管理
// @Accept json
// @Produce json
// @Param id path int true "农药ID"
// @Success 200 {object} response.Response{data=models.Pesticide}
// @Router /api/pesticides/{id} [get]
func (h *PesticideHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var p models.Pesticide
	querySQL := `SELECT id, name, registration_no, manufacturer, safe_interval_days, 
		usage_method, status, created_at, updated_at 
		FROM pesticides WHERE id = ?`
	err = database.QueryRow(querySQL, id).Scan(&p.ID, &p.Name, &p.RegistrationNo, &p.Manufacturer,
		&p.SafeIntervalDays, &p.UsageMethod, &p.Status, &p.CreatedAt, &p.UpdatedAt)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "农药不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	return response.Success(c, p)
}

// Create 创建农药
// @Summary 创建农药
// @Description 新增农药信息
// @Tags 农药管理
// @Accept json
// @Produce json
// @Param pesticide body models.PesticideCreateRequest true "农药信息"
// @Success 200 {object} response.Response{data=map[string]int64}
// @Router /api/pesticides [post]
func (h *PesticideHandler) Create(c echo.Context) error {
	var req models.PesticideCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.Name == "" {
		return response.BadRequest(c, "农药名称不能为空")
	}
	if req.SafeIntervalDays < 0 {
		return response.BadRequest(c, "安全间隔期不能为负数")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	insertSQL := `INSERT INTO pesticides (name, registration_no, manufacturer, safe_interval_days, 
		usage_method, status) VALUES (?, ?, ?, ?, ?, ?)`
	status := req.Status
	if status == 0 {
		status = 1
	}
	result, err := database.Exec(insertSQL, req.Name, req.RegistrationNo, req.Manufacturer,
		req.SafeIntervalDays, req.UsageMethod, status)
	if err != nil {
		return response.InternalServerError(c, "创建失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	return response.Success(c, map[string]int64{"id": id})
}

// Update 更新农药
// @Summary 更新农药
// @Description 根据ID更新农药信息
// @Tags 农药管理
// @Accept json
// @Produce json
// @Param id path int true "农药ID"
// @Param pesticide body models.PesticideUpdateRequest true "更新的农药信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/pesticides/{id} [put]
func (h *PesticideHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req models.PesticideUpdateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.SafeIntervalDays < 0 {
		return response.BadRequest(c, "安全间隔期不能为负数")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var setClauses []string
	var args []interface{}

	if req.Name != "" {
		setClauses = append(setClauses, "name = ?")
		args = append(args, req.Name)
	}
	if req.RegistrationNo != "" {
		setClauses = append(setClauses, "registration_no = ?")
		args = append(args, req.RegistrationNo)
	}
	if req.Manufacturer != "" {
		setClauses = append(setClauses, "manufacturer = ?")
		args = append(args, req.Manufacturer)
	}
	if req.SafeIntervalDays > 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "safe_interval_days = ?")
		args = append(args, req.SafeIntervalDays)
	}
	if req.UsageMethod != "" {
		setClauses = append(setClauses, "usage_method = ?")
		args = append(args, req.UsageMethod)
	}
	if req.Status != 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "status = ?")
		args = append(args, req.Status)
	}

	if len(setClauses) == 0 {
		return response.BadRequest(c, "没有需要更新的字段")
	}

	args = append(args, id)
	updateSQL := "UPDATE pesticides SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "农药不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除农药
// @Summary 删除农药
// @Description 根据ID删除农药
// @Tags 农药管理
// @Accept json
// @Produce json
// @Param id path int true "农药ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/pesticides/{id} [delete]
func (h *PesticideHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	deleteSQL := "DELETE FROM pesticides WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "农药不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}
