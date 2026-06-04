package handlers

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"time"

	"tcm-traceability/pkg/db"
	"tcm-traceability/pkg/response"
	"tcm-traceability/utils"

	"github.com/labstack/echo/v4"
)

type OutboundHandler struct{}

func NewOutboundHandler() *OutboundHandler {
	return &OutboundHandler{}
}

// OutboundDetail 出库记录详情
type OutboundDetail struct {
	ID              uint64    `json:"id"`
	OutboundNo      string    `json:"outbound_no"`
	ProductID       uint64    `json:"product_id"`
	ProductName     string    `json:"product_name"`
	ProductCode     string    `json:"product_code"`
	BatchID         uint64    `json:"batch_id"`
	BatchNo         string    `json:"batch_no"`
	Quantity        int       `json:"quantity"`
	OutboundDate    string    `json:"outbound_date"`
	Receiver        string    `json:"receiver"`
	OperatorID      uint64    `json:"operator_id"`
	OperatorName    string    `json:"operator_name"`
	SafeCheckPassed int8      `json:"safe_check_passed"`
	SafeCheckDetail string    `json:"safe_check_detail"`
	Remark          string    `json:"remark"`
	CreatedAt       time.Time `json:"created_at"`
}

// OutboundCreateRequest 创建出库记录请求
type OutboundCreateRequest struct {
	ProductID  uint64 `json:"product_id" validate:"required"`
	Quantity   int    `json:"quantity" validate:"required,min=1"`
	Receiver   string `json:"receiver" validate:"max=100"`
	OperatorID uint64 `json:"operator_id" validate:"required"`
	Remark     string `json:"remark"`
}

// SafetyCheckResponse 安全检查响应
type SafetyCheckResponse struct {
	CanOutbound  bool   `json:"can_outbound"`
	Passed       int8   `json:"passed"`
	Remark       string `json:"remark"`
	AvailableQty int    `json:"available_quantity"`
}

// GetList 分页查询出库记录列表
// @Summary 分页查询出库记录列表
// @Description 根据产品、批次、出库日期范围等条件分页查询出库记录
// @Tags 出库管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param product_id query int false "产品ID"
// @Param batch_id query int false "批次ID"
// @Param start_date query string false "出库开始日期（YYYY-MM-DD）"
// @Param end_date query string false "出库结束日期（YYYY-MM-DD）"
// @Param receiver query string false "接收方（模糊查询）"
// @Param safe_check_passed query int false "安全检查是否通过：1-是 0-否"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]OutboundDetail}}
// @Router /api/outbounds [get]
func (h *OutboundHandler) GetList(c echo.Context) error {
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

	productIDStr := c.QueryParam("product_id")
	batchIDStr := c.QueryParam("batch_id")
	startDate := c.QueryParam("start_date")
	endDate := c.QueryParam("end_date")
	receiver := c.QueryParam("receiver")
	safeCheckStr := c.QueryParam("safe_check_passed")

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

	if productIDStr != "" {
		productID, _ := strconv.ParseUint(productIDStr, 10, 64)
		whereClauses = append(whereClauses, "orl.product_id = ?")
		args = append(args, productID)
	}
	if batchIDStr != "" {
		batchID, _ := strconv.ParseUint(batchIDStr, 10, 64)
		whereClauses = append(whereClauses, "orl.batch_id = ?")
		args = append(args, batchID)
	}
	if startDate != "" {
		whereClauses = append(whereClauses, "DATE(orl.outbound_date) >= ?")
		args = append(args, startDate)
	}
	if endDate != "" {
		whereClauses = append(whereClauses, "DATE(orl.outbound_date) <= ?")
		args = append(args, endDate)
	}
	if receiver != "" {
		whereClauses = append(whereClauses, "orl.receiver LIKE ?")
		args = append(args, "%"+receiver+"%")
	}
	if safeCheckStr != "" {
		safeCheck, _ := strconv.Atoi(safeCheckStr)
		whereClauses = append(whereClauses, "orl.safe_check_passed = ?")
		args = append(args, safeCheck)
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	countSQL := "SELECT COUNT(*) FROM outbound_records orl" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT orl.id, orl.outbound_no, orl.product_id, p.product_name, p.product_code, 
		orl.batch_id, hb.batch_no, orl.quantity, 
		DATE_FORMAT(orl.outbound_date, '%Y-%m-%d %H:%i:%s'), orl.receiver, 
		orl.operator_id, op.name, orl.safe_check_passed, orl.safe_check_detail, 
		orl.remark, orl.created_at 
		FROM outbound_records orl 
		INNER JOIN products p ON orl.product_id = p.id 
		INNER JOIN harvest_batches hb ON orl.batch_id = hb.id 
		LEFT JOIN operators op ON orl.operator_id = op.id` +
		whereSQL + ` ORDER BY orl.outbound_date DESC, orl.id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var outbounds []OutboundDetail
	for rows.Next() {
		var o OutboundDetail
		err := rows.Scan(&o.ID, &o.OutboundNo, &o.ProductID, &o.ProductName, &o.ProductCode,
			&o.BatchID, &o.BatchNo, &o.Quantity, &o.OutboundDate, &o.Receiver,
			&o.OperatorID, &o.OperatorName, &o.SafeCheckPassed, &o.SafeCheckDetail,
			&o.Remark, &o.CreatedAt)
		if err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}
		outbounds = append(outbounds, o)
	}

	if outbounds == nil {
		outbounds = []OutboundDetail{}
	}

	return response.SuccessWithPaginated(c, outbounds, total, page, pageSize)
}

// GetByID 根据ID获取出库记录详情
// @Summary 获取出库记录详情
// @Description 根据ID获取出库记录详细信息
// @Tags 出库管理
// @Accept json
// @Produce json
// @Param id path int true "出库记录ID"
// @Success 200 {object} response.Response{data=OutboundDetail}
// @Router /api/outbounds/{id} [get]
func (h *OutboundHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var o OutboundDetail
	querySQL := `SELECT orl.id, orl.outbound_no, orl.product_id, p.product_name, p.product_code, 
		orl.batch_id, hb.batch_no, orl.quantity, 
		DATE_FORMAT(orl.outbound_date, '%Y-%m-%d %H:%i:%s'), orl.receiver, 
		orl.operator_id, op.name, orl.safe_check_passed, orl.safe_check_detail, 
		orl.remark, orl.created_at 
		FROM outbound_records orl 
		INNER JOIN products p ON orl.product_id = p.id 
		INNER JOIN harvest_batches hb ON orl.batch_id = hb.id 
		LEFT JOIN operators op ON orl.operator_id = op.id 
		WHERE orl.id = ?`
	err = database.QueryRow(querySQL, id).Scan(&o.ID, &o.OutboundNo, &o.ProductID, &o.ProductName, &o.ProductCode,
		&o.BatchID, &o.BatchNo, &o.Quantity, &o.OutboundDate, &o.Receiver,
		&o.OperatorID, &o.OperatorName, &o.SafeCheckPassed, &o.SafeCheckDetail,
		&o.Remark, &o.CreatedAt)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "出库记录不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	return response.Success(c, o)
}

// GetSafetyCheck 预检查某个产品是否可以出库
// @Summary 预检查出库安全
// @Description 预检查某个产品是否满足出库条件（安全间隔期、库存等）
// @Tags 出库管理
// @Accept json
// @Produce json
// @Param product_id path int true "产品ID"
// @Success 200 {object} response.Response{data=SafetyCheckResponse}
// @Router /api/outbounds/safety-check/{product_id} [get]
func (h *OutboundHandler) GetSafetyCheck(c echo.Context) error {
	productID, err := strconv.ParseUint(c.Param("product_id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的产品ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var batchID uint64
	var availableQty int
	var productStatus int8
	productQuery := `SELECT batch_id, available_quantity, status FROM products WHERE id = ?`
	err = database.QueryRow(productQuery, productID).Scan(&batchID, &availableQty, &productStatus)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "产品不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询产品信息失败")
	}

	if productStatus != 1 {
		return response.Success(c, SafetyCheckResponse{
			CanOutbound:  false,
			Passed:       0,
			Remark:       "产品状态异常，无法出库",
			AvailableQty: availableQty,
		})
	}

	safetyResult, err := utils.CheckSafetyIntervalForOutbound(database, int64(batchID))
	if err != nil {
		return response.InternalServerError(c, "安全间隔期检查失败: "+err.Error())
	}

	passed := int8(0)
	if safetyResult.Passed {
		passed = 1
	}

	canOutbound := safetyResult.Passed && availableQty > 0

	return response.Success(c, SafetyCheckResponse{
		CanOutbound:  canOutbound,
		Passed:       passed,
		Remark:       safetyResult.Remark,
		AvailableQty: availableQty,
	})
}

// Create 创建出库记录
// @Summary 创建出库记录
// @Description 新增出库记录，先进行安全间隔期检查，只有检查通过才能出库；自动生成出库单号OUT-YYYYMMDD-XXX；更新产品可用数量
// @Tags 出库管理
// @Accept json
// @Produce json
// @Param outbound body OutboundCreateRequest true "出库信息"
// @Success 200 {object} response.Response{data=map[string]interface{}}
// @Router /api/outbounds [post]
func (h *OutboundHandler) Create(c echo.Context) error {
	var req OutboundCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.ProductID == 0 {
		return response.BadRequest(c, "产品ID不能为空")
	}
	if req.Quantity <= 0 {
		return response.BadRequest(c, "出库数量必须大于0")
	}
	if req.OperatorID == 0 {
		return response.BadRequest(c, "操作人ID不能为空")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var batchID uint64
	var availableQty int
	var productStatus int8
	productQuery := `SELECT batch_id, available_quantity, status FROM products WHERE id = ?`
	err = database.QueryRow(productQuery, req.ProductID).Scan(&batchID, &availableQty, &productStatus)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "产品不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询产品信息失败")
	}

	if productStatus != 1 {
		return response.BadRequest(c, "产品状态异常，无法出库")
	}

	if req.Quantity > availableQty {
		return response.BadRequest(c, "库存不足，可用数量为"+strconv.Itoa(availableQty))
	}

	var operatorExists int
	operatorCheckSQL := "SELECT COUNT(*) FROM operators WHERE id = ?"
	if err := database.QueryRow(operatorCheckSQL, req.OperatorID).Scan(&operatorExists); err != nil {
		return response.InternalServerError(c, "检查操作人失败")
	}
	if operatorExists == 0 {
		return response.BadRequest(c, "操作人不存在")
	}

	safetyResult, err := utils.CheckSafetyIntervalForOutbound(database, int64(batchID))
	if err != nil {
		return response.InternalServerError(c, "安全间隔期检查失败: "+err.Error())
	}

	if !safetyResult.Passed {
		return response.BadRequest(c, "安全间隔期检查不通过: "+safetyResult.Remark)
	}

	tx, err := database.Begin()
	if err != nil {
		return response.InternalServerError(c, "开启事务失败")
	}
	defer tx.Rollback()

	outboundNo, err := generateOutboundNo(tx)
	if err != nil {
		return response.InternalServerError(c, "生成出库单号失败")
	}

	safeCheckPassed := int8(1)
	if !safetyResult.Passed {
		safeCheckPassed = 0
	}

	insertSQL := `INSERT INTO outbound_records (outbound_no, product_id, batch_id, quantity, 
		outbound_date, receiver, operator_id, safe_check_passed, safe_check_detail, remark) 
		VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`
	result, err := tx.Exec(insertSQL, outboundNo, req.ProductID, batchID, req.Quantity,
		req.Receiver, req.OperatorID, safeCheckPassed, safetyResult.Remark, req.Remark)
	if err != nil {
		return response.InternalServerError(c, "创建出库记录失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	updateProductSQL := `UPDATE products SET available_quantity = available_quantity - ?, 
		status = CASE WHEN available_quantity - ? = 0 THEN 2 ELSE status END 
		WHERE id = ?`
	_, err = tx.Exec(updateProductSQL, req.Quantity, req.Quantity, req.ProductID)
	if err != nil {
		return response.InternalServerError(c, "更新产品库存失败")
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	return response.Success(c, map[string]interface{}{
		"id":             id,
		"outbound_no":    outboundNo,
		"product_id":     req.ProductID,
		"quantity":       req.Quantity,
		"available_qty":  availableQty - req.Quantity,
		"safety_passed":  safetyResult.Passed,
		"safety_remark":  safetyResult.Remark,
	})
}

// generateOutboundNo 生成出库单号 OUT-YYYYMMDD-XXX
func generateOutboundNo(tx *sql.Tx) (string, error) {
	now := time.Now()
	dateStr := now.Format("20060102")
	prefix := fmt.Sprintf("OUT-%s-", dateStr)

	var maxSuffix int
	querySQL := `SELECT COALESCE(MAX(CAST(SUBSTRING(outbound_no, ?) AS UNSIGNED)), 0) 
		FROM outbound_records WHERE outbound_no LIKE ?`
	prefixLen := len(prefix) + 1
	err := tx.QueryRow(querySQL, prefixLen, prefix+"%").Scan(&maxSuffix)
	if err != nil {
		return "", err
	}

	for i := maxSuffix + 1; i <= 999; i++ {
		outboundNo := fmt.Sprintf("%s%03d", prefix, i)
		var exists int
		checkSQL := "SELECT COUNT(*) FROM outbound_records WHERE outbound_no = ?"
		err := tx.QueryRow(checkSQL, outboundNo).Scan(&exists)
		if err != nil {
			return "", err
		}
		if exists == 0 {
			return outboundNo, nil
		}
	}

	return "", fmt.Errorf("今日出库单号已用尽")
}
