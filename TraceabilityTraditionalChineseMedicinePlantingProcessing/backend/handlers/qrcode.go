package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"
	"time"

	"tcm-traceability/config"
	"tcm-traceability/pkg/db"
	"tcm-traceability/pkg/response"
	"tcm-traceability/utils"

	"github.com/labstack/echo/v4"
)

type QRCodeHandler struct{}

func NewQRCodeHandler() *QRCodeHandler {
	return &QRCodeHandler{}
}

// QRCodeCreateRequest 创建二维码请求
type QRCodeCreateRequest struct {
	ProductID uint64 `json:"product_id" validate:"required"`
}

// QRCodeBatchGenerateRequest 批量生成二维码请求
type QRCodeBatchGenerateRequest struct {
	ProductID uint64 `json:"product_id" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required,min=1,max=1000"`
}

// QRCodeWithURL 二维码信息（带访问URL）
type QRCodeWithURL struct {
	ID         uint64     `json:"id"`
	QRCode     string     `json:"qr_code"`
	ProductID  uint64     `json:"product_id"`
	BatchID    uint64     `json:"batch_id"`
	ScanCount  int        `json:"scan_count"`
	LastScanAt *time.Time `json:"last_scan_at"`
	Status     int8       `json:"status"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	ScanURL    string     `json:"scan_url"`
}

// GetList 分页查询二维码列表
// @Summary 分页查询二维码列表
// @Description 根据产品、状态等条件分页查询二维码
// @Tags 二维码管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param product_id query int false "产品ID"
// @Param status query int false "状态：1-有效 0-无效"
// @Param qr_code query string false "二维码内容（模糊查询）"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]QRCodeWithURL}}
// @Router /api/qrcodes [get]
func (h *QRCodeHandler) GetList(c echo.Context) error {
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
	statusStr := c.QueryParam("status")
	qrCode := c.QueryParam("qr_code")

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
		whereClauses = append(whereClauses, "product_id = ?")
		args = append(args, productID)
	}
	if statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		whereClauses = append(whereClauses, "status = ?")
		args = append(args, status)
	}
	if qrCode != "" {
		whereClauses = append(whereClauses, "qr_code LIKE ?")
		args = append(args, "%"+qrCode+"%")
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	countSQL := "SELECT COUNT(*) FROM qr_codes" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT id, qr_code, product_id, batch_id, scan_count, last_scan_at, 
		status, created_at, updated_at FROM qr_codes` + whereSQL + ` ORDER BY id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	baseURL := config.AppConfig.QRCodeBaseURL
	var qrCodes []QRCodeWithURL
	for rows.Next() {
		var q QRCodeWithURL
		err := rows.Scan(&q.ID, &q.QRCode, &q.ProductID, &q.BatchID, &q.ScanCount,
			&q.LastScanAt, &q.Status, &q.CreatedAt, &q.UpdatedAt)
		if err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}
		q.ScanURL = baseURL + "/" + q.QRCode
		qrCodes = append(qrCodes, q)
	}

	if qrCodes == nil {
		qrCodes = []QRCodeWithURL{}
	}

	return response.SuccessWithPaginated(c, qrCodes, total, page, pageSize)
}

// GetByID 根据ID获取二维码详情
// @Summary 获取二维码详情
// @Description 根据ID获取二维码详细信息
// @Tags 二维码管理
// @Accept json
// @Produce json
// @Param id path int true "二维码ID"
// @Success 200 {object} response.Response{data=QRCodeWithURL}
// @Router /api/qrcodes/{id} [get]
func (h *QRCodeHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var q QRCodeWithURL
	querySQL := `SELECT id, qr_code, product_id, batch_id, scan_count, last_scan_at, 
		status, created_at, updated_at FROM qr_codes WHERE id = ?`
	err = database.QueryRow(querySQL, id).Scan(&q.ID, &q.QRCode, &q.ProductID, &q.BatchID,
		&q.ScanCount, &q.LastScanAt, &q.Status, &q.CreatedAt, &q.UpdatedAt)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "二维码不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	baseURL := config.AppConfig.QRCodeBaseURL
	q.ScanURL = baseURL + "/" + q.QRCode

	return response.Success(c, q)
}

// Create 创建二维码
// @Summary 创建二维码
// @Description 调用存储过程sp_generate_qr_code生成单个二维码
// @Tags 二维码管理
// @Accept json
// @Produce json
// @Param qrcode body QRCodeCreateRequest true "产品ID"
// @Success 200 {object} response.Response{data=QRCodeWithURL}
// @Router /api/qrcodes [post]
func (h *QRCodeHandler) Create(c echo.Context) error {
	var req QRCodeCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.ProductID == 0 {
		return response.BadRequest(c, "产品ID不能为空")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var productExists int
	productCheckSQL := "SELECT COUNT(*) FROM products WHERE id = ?"
	if err := database.QueryRow(productCheckSQL, req.ProductID).Scan(&productExists); err != nil {
		return response.InternalServerError(c, "检查产品失败")
	}
	if productExists == 0 {
		return response.BadRequest(c, "产品不存在")
	}

	var qrCodeStr string
	callSQL := "CALL sp_generate_qr_code(?, ?)"
	_, err = database.Exec(callSQL, req.ProductID, sql.Named("p_qr_code", sql.Out{Dest: &qrCodeStr}))
	if err != nil {
		return response.InternalServerError(c, "生成二维码失败: "+err.Error())
	}

	var q QRCodeWithURL
	querySQL := `SELECT id, qr_code, product_id, batch_id, scan_count, last_scan_at, 
		status, created_at, updated_at FROM qr_codes WHERE qr_code = ?`
	err = database.QueryRow(querySQL, qrCodeStr).Scan(&q.ID, &q.QRCode, &q.ProductID, &q.BatchID,
		&q.ScanCount, &q.LastScanAt, &q.Status, &q.CreatedAt, &q.UpdatedAt)
	if err != nil {
		return response.InternalServerError(c, "查询二维码失败")
	}

	baseURL := config.AppConfig.QRCodeBaseURL
	q.ScanURL = baseURL + "/" + q.QRCode

	return response.Success(c, q)
}

// GenerateForProduct 为某个产品批量生成二维码
// @Summary 批量生成二维码
// @Description 为指定产品批量生成指定数量的二维码
// @Tags 二维码管理
// @Accept json
// @Produce json
// @Param qrcode body QRCodeBatchGenerateRequest true "产品ID和数量"
// @Success 200 {object} response.Response{data=map[string]interface{}}
// @Router /api/qrcodes/batch [post]
func (h *QRCodeHandler) GenerateForProduct(c echo.Context) error {
	var req QRCodeBatchGenerateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.ProductID == 0 {
		return response.BadRequest(c, "产品ID不能为空")
	}
	if req.Quantity <= 0 || req.Quantity > 1000 {
		return response.BadRequest(c, "生成数量必须在1-1000之间")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var productExists int
	productCheckSQL := "SELECT COUNT(*) FROM products WHERE id = ?"
	if err := database.QueryRow(productCheckSQL, req.ProductID).Scan(&productExists); err != nil {
		return response.InternalServerError(c, "检查产品失败")
	}
	if productExists == 0 {
		return response.BadRequest(c, "产品不存在")
	}

	tx, err := database.Begin()
	if err != nil {
		return response.InternalServerError(c, "开启事务失败")
	}
	defer tx.Rollback()

	generatedCodes := make([]string, 0, req.Quantity)
	callSQL := "CALL sp_generate_qr_code(?, ?)"

	for i := 0; i < req.Quantity; i++ {
		var qrCodeStr string
		_, err := tx.Exec(callSQL, req.ProductID, sql.Named("p_qr_code", sql.Out{Dest: &qrCodeStr}))
		if err != nil {
			return response.InternalServerError(c, "生成第"+strconv.Itoa(i+1)+"个二维码失败: "+err.Error())
		}
		generatedCodes = append(generatedCodes, qrCodeStr)
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	return response.Success(c, map[string]interface{}{
		"product_id":     req.ProductID,
		"total_generated": len(generatedCodes),
		"qr_codes":       generatedCodes,
	})
}

// GetQRCodeImage 生成二维码图片返回
// @Summary 获取二维码图片
// @Description 根据二维码ID或内容生成二维码图片并返回，URL格式：{base_url}/scan/{qr_code}
// @Tags 二维码管理
// @Accept image/png
// @Produce image/png
// @Param identifier path string true "二维码ID或二维码内容"
// @Success 200 {file} file "二维码图片"
// @Router /api/qrcodes/{identifier}/image [get]
func (h *QRCodeHandler) GetQRCodeImage(c echo.Context) error {
	identifier := c.Param("identifier")
	if identifier == "" {
		return response.BadRequest(c, "二维码标识不能为空")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var qrCodeStr string
	var querySQL string

	if id, err := strconv.ParseUint(identifier, 10, 64); err == nil {
		querySQL = "SELECT qr_code FROM qr_codes WHERE id = ?"
		err = database.QueryRow(querySQL, id).Scan(&qrCodeStr)
	} else {
		querySQL = "SELECT qr_code FROM qr_codes WHERE qr_code = ?"
		err = database.QueryRow(querySQL, identifier).Scan(&qrCodeStr)
	}

	if err == sql.ErrNoRows {
		return response.NotFound(c, "二维码不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询二维码失败")
	}

	baseURL := config.AppConfig.QRCodeBaseURL
	scanURL := baseURL + "/" + qrCodeStr

	qrBytes, err := utils.GenerateQRCode(scanURL)
	if err != nil {
		return response.InternalServerError(c, "生成二维码图片失败")
	}

	c.Response().Header().Set(echo.HeaderContentType, "image/png")
	c.Response().Header().Set(echo.HeaderContentDisposition, "inline; filename="+qrCodeStr+".png")
	c.Response().Header().Set("Cache-Control", "public, max-age=31536000")
	return c.Blob(http.StatusOK, "image/png", qrBytes)
}
