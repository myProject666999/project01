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

type OperatorHandler struct{}

func NewOperatorHandler() *OperatorHandler {
	return &OperatorHandler{}
}

// GetList 分页查询操作人员列表
// @Summary 分页查询操作人员列表
// @Description 根据条件分页查询操作人员
// @Tags 操作人员
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param name query string false "姓名（模糊查询）"
// @Param role query string false "角色：planter/processor/manager"
// @Param status query int false "状态：1-启用 0-禁用"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.Operator}}
// @Router /api/operators [get]
func (h *OperatorHandler) GetList(c echo.Context) error {
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
	role := c.QueryParam("role")
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
	if role != "" {
		whereClauses = append(whereClauses, "role = ?")
		args = append(args, role)
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

	countSQL := "SELECT COUNT(*) FROM operators" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, name, phone, role, status, created_at, updated_at 
		FROM operators` + whereSQL + ` ORDER BY id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var operators []models.Operator
	for rows.Next() {
		var op models.Operator
		if err := rows.Scan(&op.ID, &op.Name, &op.Phone, &op.Role, &op.Status, &op.CreatedAt, &op.UpdatedAt); err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}
		operators = append(operators, op)
	}

	if operators == nil {
		operators = []models.Operator{}
	}

	return response.SuccessWithPaginated(c, operators, total, page, pageSize)
}

// GetByID 根据ID获取操作人员详情
// @Summary 获取操作人员详情
// @Description 根据ID获取操作人员详细信息
// @Tags 操作人员
// @Accept json
// @Produce json
// @Param id path int true "操作人员ID"
// @Success 200 {object} response.Response{data=models.Operator}
// @Router /api/operators/{id} [get]
func (h *OperatorHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var op models.Operator
	querySQL := `SELECT id, name, phone, role, status, created_at, updated_at 
		FROM operators WHERE id = ?`
	err = database.QueryRow(querySQL, id).Scan(&op.ID, &op.Name, &op.Phone, &op.Role, &op.Status, &op.CreatedAt, &op.UpdatedAt)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "操作人员不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	return response.Success(c, op)
}

// Create 创建操作人员
// @Summary 创建操作人员
// @Description 新增操作人员信息
// @Tags 操作人员
// @Accept json
// @Produce json
// @Param operator body models.OperatorCreateRequest true "操作人员信息"
// @Success 200 {object} response.Response{data=map[string]int64}
// @Router /api/operators [post]
func (h *OperatorHandler) Create(c echo.Context) error {
	var req models.OperatorCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.Name == "" {
		return response.BadRequest(c, "姓名不能为空")
	}
	if req.Role == "" {
		return response.BadRequest(c, "角色不能为空")
	}
	if req.Role != "planter" && req.Role != "processor" && req.Role != "manager" {
		return response.BadRequest(c, "角色值无效，只能是planter/processor/manager")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	insertSQL := `INSERT INTO operators (name, phone, role, status) VALUES (?, ?, ?, ?)`
	status := req.Status
	if status == 0 {
		status = 1
	}
	result, err := database.Exec(insertSQL, req.Name, req.Phone, req.Role, status)
	if err != nil {
		return response.InternalServerError(c, "创建失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	return response.Success(c, map[string]int64{"id": id})
}

// Update 更新操作人员
// @Summary 更新操作人员
// @Description 根据ID更新操作人员信息
// @Tags 操作人员
// @Accept json
// @Produce json
// @Param id path int true "操作人员ID"
// @Param operator body models.OperatorUpdateRequest true "更新的操作人员信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/operators/{id} [put]
func (h *OperatorHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req models.OperatorUpdateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
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
	if req.Phone != "" {
		setClauses = append(setClauses, "phone = ?")
		args = append(args, req.Phone)
	}
	if req.Role != "" {
		if req.Role != "planter" && req.Role != "processor" && req.Role != "manager" {
			return response.BadRequest(c, "角色值无效，只能是planter/processor/manager")
		}
		setClauses = append(setClauses, "role = ?")
		args = append(args, req.Role)
	}
	if req.Status != 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "status = ?")
		args = append(args, req.Status)
	}

	if len(setClauses) == 0 {
		return response.BadRequest(c, "没有需要更新的字段")
	}

	args = append(args, id)
	updateSQL := "UPDATE operators SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "操作人员不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除操作人员
// @Summary 删除操作人员
// @Description 根据ID删除操作人员
// @Tags 操作人员
// @Accept json
// @Produce json
// @Param id path int true "操作人员ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/operators/{id} [delete]
func (h *OperatorHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	deleteSQL := "DELETE FROM operators WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "操作人员不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}
