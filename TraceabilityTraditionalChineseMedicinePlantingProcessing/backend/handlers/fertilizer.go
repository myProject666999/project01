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

type FertilizerHandler struct{}

func NewFertilizerHandler() *FertilizerHandler {
	return &FertilizerHandler{}
}

// GetList 分页查询肥料列表
// @Summary 分页查询肥料列表
// @Description 根据条件分页查询肥料
// @Tags 肥料管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param name query string false "肥料名称（模糊查询）"
// @Param type query string false "肥料类型：有机肥/复合肥/尿素等"
// @Param manufacturer query string false "生产厂家（模糊查询）"
// @Param status query int false "状态：1-启用 0-禁用"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.Fertilizer}}
// @Router /api/fertilizers [get]
func (h *FertilizerHandler) GetList(c echo.Context) error {
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
	ftype := c.QueryParam("type")
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
	if ftype != "" {
		whereClauses = append(whereClauses, "type = ?")
		args = append(args, ftype)
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

	countSQL := "SELECT COUNT(*) FROM fertilizers" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, name, type, manufacturer, nutrient_content, status, 
		created_at, updated_at FROM fertilizers` + whereSQL + ` ORDER BY id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var fertilizers []models.Fertilizer
	for rows.Next() {
		var f models.Fertilizer
		if err := rows.Scan(&f.ID, &f.Name, &f.Type, &f.Manufacturer,
			&f.NutrientContent, &f.Status, &f.CreatedAt, &f.UpdatedAt); err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}
		fertilizers = append(fertilizers, f)
	}

	if fertilizers == nil {
		fertilizers = []models.Fertilizer{}
	}

	return response.SuccessWithPaginated(c, fertilizers, total, page, pageSize)
}

// GetByID 根据ID获取肥料详情
// @Summary 获取肥料详情
// @Description 根据ID获取肥料详细信息
// @Tags 肥料管理
// @Accept json
// @Produce json
// @Param id path int true "肥料ID"
// @Success 200 {object} response.Response{data=models.Fertilizer}
// @Router /api/fertilizers/{id} [get]
func (h *FertilizerHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var f models.Fertilizer
	querySQL := `SELECT id, name, type, manufacturer, nutrient_content, status, 
		created_at, updated_at FROM fertilizers WHERE id = ?`
	err = database.QueryRow(querySQL, id).Scan(&f.ID, &f.Name, &f.Type, &f.Manufacturer,
		&f.NutrientContent, &f.Status, &f.CreatedAt, &f.UpdatedAt)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "肥料不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	return response.Success(c, f)
}

// Create 创建肥料
// @Summary 创建肥料
// @Description 新增肥料信息
// @Tags 肥料管理
// @Accept json
// @Produce json
// @Param fertilizer body models.FertilizerCreateRequest true "肥料信息"
// @Success 200 {object} response.Response{data=map[string]int64}
// @Router /api/fertilizers [post]
func (h *FertilizerHandler) Create(c echo.Context) error {
	var req models.FertilizerCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.Name == "" {
		return response.BadRequest(c, "肥料名称不能为空")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	insertSQL := `INSERT INTO fertilizers (name, type, manufacturer, nutrient_content, status) 
		VALUES (?, ?, ?, ?, ?)`
	status := req.Status
	if status == 0 {
		status = 1
	}
	result, err := database.Exec(insertSQL, req.Name, req.Type, req.Manufacturer,
		req.NutrientContent, status)
	if err != nil {
		return response.InternalServerError(c, "创建失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	return response.Success(c, map[string]int64{"id": id})
}

// Update 更新肥料
// @Summary 更新肥料
// @Description 根据ID更新肥料信息
// @Tags 肥料管理
// @Accept json
// @Produce json
// @Param id path int true "肥料ID"
// @Param fertilizer body models.FertilizerUpdateRequest true "更新的肥料信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/fertilizers/{id} [put]
func (h *FertilizerHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req models.FertilizerUpdateRequest
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
	if req.Type != "" {
		setClauses = append(setClauses, "type = ?")
		args = append(args, req.Type)
	}
	if req.Manufacturer != "" {
		setClauses = append(setClauses, "manufacturer = ?")
		args = append(args, req.Manufacturer)
	}
	if req.NutrientContent != "" {
		setClauses = append(setClauses, "nutrient_content = ?")
		args = append(args, req.NutrientContent)
	}
	if req.Status != 0 || c.Request().Body != http.NoBody {
		setClauses = append(setClauses, "status = ?")
		args = append(args, req.Status)
	}

	if len(setClauses) == 0 {
		return response.BadRequest(c, "没有需要更新的字段")
	}

	args = append(args, id)
	updateSQL := "UPDATE fertilizers SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "肥料不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除肥料
// @Summary 删除肥料
// @Description 根据ID删除肥料
// @Tags 肥料管理
// @Accept json
// @Produce json
// @Param id path int true "肥料ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/fertilizers/{id} [delete]
func (h *FertilizerHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	deleteSQL := "DELETE FROM fertilizers WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "肥料不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}
