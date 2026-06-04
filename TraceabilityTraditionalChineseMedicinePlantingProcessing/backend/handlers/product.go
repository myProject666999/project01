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

type ProductHandler struct{}

func NewProductHandler() *ProductHandler {
	return &ProductHandler{}
}

// ProductDetail 产品详情（包含关联批次信息）
type ProductDetail struct {
	ID                uint64          `json:"id"`
	ProductCode       string          `json:"product_code"`
	ProductName       string          `json:"product_name"`
	BatchID           uint64          `json:"batch_id"`
	Specification     string          `json:"specification"`
	PackageType       string          `json:"package_type"`
	NetWeight         *float64        `json:"net_weight"`
	ProductionDate    *string         `json:"production_date"`
	ShelfLifeMonths   *int            `json:"shelf_life_months"`
	StorageCondition  string          `json:"storage_condition"`
	TotalQuantity     int             `json:"total_quantity"`
	AvailableQuantity int             `json:"available_quantity"`
	Status            int8            `json:"status"`
	Remark            string          `json:"remark"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
	Batch             *models.HarvestBatch `json:"batch,omitempty"`
}

// ProductCreateRequest 创建产品请求
type ProductCreateRequest struct {
	ProductName      string  `json:"product_name" validate:"required,max=100"`
	BatchID          uint64  `json:"batch_id" validate:"required"`
	Specification    string  `json:"specification" validate:"max=50"`
	PackageType      string  `json:"package_type" validate:"max=50"`
	NetWeight        *float64 `json:"net_weight"`
	ProductionDate   string  `json:"production_date"`
	ShelfLifeMonths  *int    `json:"shelf_life_months"`
	StorageCondition string  `json:"storage_condition" validate:"max=200"`
	TotalQuantity    int     `json:"total_quantity" validate:"required,min=1"`
	Status           int8    `json:"status" validate:"oneof=0 1 2"`
	Remark           string  `json:"remark"`
}

// ProductUpdateRequest 更新产品请求
type ProductUpdateRequest struct {
	ProductName      string  `json:"product_name" validate:"omitempty,max=100"`
	BatchID          uint64  `json:"batch_id"`
	Specification    string  `json:"specification" validate:"omitempty,max=50"`
	PackageType      string  `json:"package_type" validate:"omitempty,max=50"`
	NetWeight        *float64 `json:"net_weight"`
	ProductionDate   string  `json:"production_date"`
	ShelfLifeMonths  *int    `json:"shelf_life_months"`
	StorageCondition string  `json:"storage_condition" validate:"omitempty,max=200"`
	TotalQuantity    int     `json:"total_quantity" validate:"omitempty,min=1"`
	Status           int8    `json:"status" validate:"omitempty,oneof=0 1 2"`
	Remark           string  `json:"remark"`
}

// GetList 分页查询产品列表
// @Summary 分页查询产品列表
// @Description 根据批次、状态等条件分页查询产品
// @Tags 产品管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页条数" default(10)
// @Param batch_id query int false "批次ID"
// @Param status query int false "状态：1-在库 2-已出库 0-冻结"
// @Param product_name query string false "产品名称（模糊查询）"
// @Param product_code query string false "产品编号（模糊查询）"
// @Success 200 {object} response.Response{data=response.PaginatedResponse{list=[]models.Product}}
// @Router /api/products [get]
func (h *ProductHandler) GetList(c echo.Context) error {
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
	statusStr := c.QueryParam("status")
	productName := c.QueryParam("product_name")
	productCode := c.QueryParam("product_code")

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
		whereClauses = append(whereClauses, "p.batch_id = ?")
		args = append(args, batchID)
	}
	if statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		whereClauses = append(whereClauses, "p.status = ?")
		args = append(args, status)
	}
	if productName != "" {
		whereClauses = append(whereClauses, "p.product_name LIKE ?")
		args = append(args, "%"+productName+"%")
	}
	if productCode != "" {
		whereClauses = append(whereClauses, "p.product_code LIKE ?")
		args = append(args, "%"+productCode+"%")
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	countSQL := "SELECT COUNT(*) FROM products p" + whereSQL
	var total int64
	if err := database.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return response.InternalServerError(c, "查询总数失败")
	}

	querySQL := `SELECT p.id, p.product_code, p.product_name, p.batch_id, p.specification, 
		p.package_type, p.net_weight, p.production_date, p.shelf_life_months, 
		p.storage_condition, p.total_quantity, p.available_quantity, p.status, 
		p.remark, p.created_at, p.updated_at 
		FROM products p` + whereSQL + ` ORDER BY p.id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.Query(querySQL, args...)
	if err != nil {
		return response.InternalServerError(c, "查询列表失败")
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		err := rows.Scan(&p.ID, &p.ProductCode, &p.ProductName, &p.BatchID, &p.Specification,
			&p.PackageType, &p.NetWeight, &p.ProductionDate, &p.ShelfLifeMonths,
			&p.StorageCondition, &p.TotalQuantity, &p.AvailableQuantity, &p.Status,
			&p.Remark, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return response.InternalServerError(c, "数据解析失败")
		}
		products = append(products, p)
	}

	if products == nil {
		products = []models.Product{}
	}

	return response.SuccessWithPaginated(c, products, total, page, pageSize)
}

// GetByID 根据ID获取产品详情（包含关联批次信息）
// @Summary 获取产品详情
// @Description 根据ID获取产品详细信息，包含关联的批次信息
// @Tags 产品管理
// @Accept json
// @Produce json
// @Param id path int true "产品ID"
// @Success 200 {object} response.Response{data=ProductDetail}
// @Router /api/products/{id} [get]
func (h *ProductHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var detail ProductDetail
	var productionDate sql.NullTime

	querySQL := `SELECT p.id, p.product_code, p.product_name, p.batch_id, p.specification, 
		p.package_type, p.net_weight, p.production_date, p.shelf_life_months, 
		p.storage_condition, p.total_quantity, p.available_quantity, p.status, 
		p.remark, p.created_at, p.updated_at 
		FROM products p WHERE p.id = ?`
	err = database.QueryRow(querySQL, id).Scan(&detail.ID, &detail.ProductCode, &detail.ProductName,
		&detail.BatchID, &detail.Specification, &detail.PackageType, &detail.NetWeight,
		&productionDate, &detail.ShelfLifeMonths, &detail.StorageCondition, &detail.TotalQuantity,
		&detail.AvailableQuantity, &detail.Status, &detail.Remark, &detail.CreatedAt, &detail.UpdatedAt)
	if err == sql.ErrNoRows {
		return response.NotFound(c, "产品不存在")
	}
	if err != nil {
		return response.InternalServerError(c, "查询失败")
	}

	if productionDate.Valid {
		dateStr := productionDate.Time.Format("2006-01-02")
		detail.ProductionDate = &dateStr
	}

	batchQuery := `SELECT hb.id, hb.batch_no, hb.plot_id, hb.variety_id, hb.harvest_date, 
		hb.quantity, hb.quality_level, hb.operator_id, hb.harvest_method, 
		hb.weather_condition, hb.safe_check_passed, hb.safe_check_remark, 
		hb.status, hb.remark, hb.created_at, hb.updated_at 
		FROM harvest_batches hb WHERE hb.id = ?`
	var batch models.HarvestBatch
	var harvestDate sql.NullTime
	err = database.QueryRow(batchQuery, detail.BatchID).Scan(&batch.ID, &batch.BatchNo,
		&batch.PlotID, &batch.VarietyID, &harvestDate, &batch.Quantity, &batch.QualityLevel,
		&batch.OperatorID, &batch.HarvestMethod, &batch.WeatherCondition, &batch.SafeCheckPassed,
		&batch.SafeCheckRemark, &batch.Status, &batch.Remark, &batch.CreatedAt, &batch.UpdatedAt)
	if err == nil {
		if harvestDate.Valid {
			batch.HarvestDate = harvestDate.Time
		}
		detail.Batch = &batch
	}

	return response.Success(c, detail)
}

// Create 创建产品
// @Summary 创建产品
// @Description 新增产品信息，自动生成产品编号PROD-YYYYMMDD-XXX
// @Tags 产品管理
// @Accept json
// @Produce json
// @Param product body ProductCreateRequest true "产品信息"
// @Success 200 {object} response.Response{data=map[string]interface{}}
// @Router /api/products [post]
func (h *ProductHandler) Create(c echo.Context) error {
	var req ProductCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	if req.ProductName == "" {
		return response.BadRequest(c, "产品名称不能为空")
	}
	if req.BatchID == 0 {
		return response.BadRequest(c, "批次ID不能为空")
	}
	if req.TotalQuantity <= 0 {
		return response.BadRequest(c, "总数量必须大于0")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var batchExists int
	batchCheckSQL := "SELECT COUNT(*) FROM harvest_batches WHERE id = ?"
	if err := database.QueryRow(batchCheckSQL, req.BatchID).Scan(&batchExists); err != nil {
		return response.InternalServerError(c, "检查批次失败")
	}
	if batchExists == 0 {
		return response.BadRequest(c, "批次不存在")
	}

	productCode, err := generateProductCode(database)
	if err != nil {
		return response.InternalServerError(c, "生成产品编号失败")
	}

	tx, err := database.Begin()
	if err != nil {
		return response.InternalServerError(c, "开启事务失败")
	}
	defer tx.Rollback()

	status := req.Status
	if status == 0 {
		status = 1
	}

	var productionDate interface{}
	if req.ProductionDate != "" {
		parsedDate, err := time.Parse("2006-01-02", req.ProductionDate)
		if err != nil {
			return response.BadRequest(c, "生产日期格式错误，应为YYYY-MM-DD")
		}
		productionDate = parsedDate
	} else {
		productionDate = nil
	}

	insertSQL := `INSERT INTO products (product_code, product_name, batch_id, specification, 
		package_type, net_weight, production_date, shelf_life_months, storage_condition, 
		total_quantity, available_quantity, status, remark) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := tx.Exec(insertSQL, productCode, req.ProductName, req.BatchID, req.Specification,
		req.PackageType, req.NetWeight, productionDate, req.ShelfLifeMonths, req.StorageCondition,
		req.TotalQuantity, req.TotalQuantity, status, req.Remark)
	if err != nil {
		return response.InternalServerError(c, "创建失败")
	}

	id, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取ID失败")
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	return response.Success(c, map[string]interface{}{
		"id":           id,
		"product_code": productCode,
	})
}

// Update 更新产品
// @Summary 更新产品
// @Description 根据ID更新产品信息
// @Tags 产品管理
// @Accept json
// @Produce json
// @Param id path int true "产品ID"
// @Param product body ProductUpdateRequest true "更新的产品信息"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/products/{id} [put]
func (h *ProductHandler) Update(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	var req ProductUpdateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "参数解析失败")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var exists int
	checkSQL := "SELECT COUNT(*) FROM products WHERE id = ?"
	if err := database.QueryRow(checkSQL, id).Scan(&exists); err != nil {
		return response.InternalServerError(c, "检查产品失败")
	}
	if exists == 0 {
		return response.NotFound(c, "产品不存在")
	}

	var setClauses []string
	var args []interface{}

	if req.ProductName != "" {
		setClauses = append(setClauses, "product_name = ?")
		args = append(args, req.ProductName)
	}
	if req.BatchID > 0 {
		var batchExists int
		batchCheckSQL := "SELECT COUNT(*) FROM harvest_batches WHERE id = ?"
		if err := database.QueryRow(batchCheckSQL, req.BatchID).Scan(&batchExists); err != nil {
			return response.InternalServerError(c, "检查批次失败")
		}
		if batchExists == 0 {
			return response.BadRequest(c, "批次不存在")
		}
		setClauses = append(setClauses, "batch_id = ?")
		args = append(args, req.BatchID)
	}
	if req.Specification != "" {
		setClauses = append(setClauses, "specification = ?")
		args = append(args, req.Specification)
	}
	if req.PackageType != "" {
		setClauses = append(setClauses, "package_type = ?")
		args = append(args, req.PackageType)
	}
	if req.NetWeight != nil {
		setClauses = append(setClauses, "net_weight = ?")
		args = append(args, *req.NetWeight)
	}
	if req.ProductionDate != "" {
		parsedDate, err := time.Parse("2006-01-02", req.ProductionDate)
		if err != nil {
			return response.BadRequest(c, "生产日期格式错误，应为YYYY-MM-DD")
		}
		setClauses = append(setClauses, "production_date = ?")
		args = append(args, parsedDate)
	}
	if req.ShelfLifeMonths != nil {
		setClauses = append(setClauses, "shelf_life_months = ?")
		args = append(args, *req.ShelfLifeMonths)
	}
	if req.StorageCondition != "" {
		setClauses = append(setClauses, "storage_condition = ?")
		args = append(args, req.StorageCondition)
	}
	if req.TotalQuantity > 0 {
		var currentAvailable int
		availSQL := "SELECT available_quantity FROM products WHERE id = ?"
		if err := database.QueryRow(availSQL, id).Scan(&currentAvailable); err != nil {
			return response.InternalServerError(c, "查询可用数量失败")
		}
		diff := req.TotalQuantity - currentAvailable
		setClauses = append(setClauses, "total_quantity = ?, available_quantity = available_quantity + ?")
		args = append(args, req.TotalQuantity, diff)
	}
	if req.Status != 0 {
		setClauses = append(setClauses, "status = ?")
		args = append(args, req.Status)
	}
	if req.Remark != "" {
		setClauses = append(setClauses, "remark = ?")
		args = append(args, req.Remark)
	}

	if len(setClauses) == 0 {
		return response.BadRequest(c, "没有需要更新的字段")
	}

	args = append(args, id)
	updateSQL := "UPDATE products SET " + strings.Join(setClauses, ", ") + " WHERE id = ?"
	result, err := database.Exec(updateSQL, args...)
	if err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取更新结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "产品不存在")
	}

	return response.Success(c, map[string]string{"message": "更新成功"})
}

// Delete 删除产品
// @Summary 删除产品
// @Description 根据ID删除产品
// @Tags 产品管理
// @Accept json
// @Produce json
// @Param id path int true "产品ID"
// @Success 200 {object} response.Response{data=map[string]string}
// @Router /api/products/{id} [delete]
func (h *ProductHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return response.BadRequest(c, "无效的ID")
	}

	database, err := db.GetDB()
	if err != nil {
		return response.InternalServerError(c, "数据库连接失败")
	}

	var qrCount int
	qrCheckSQL := "SELECT COUNT(*) FROM qr_codes WHERE product_id = ?"
	if err := database.QueryRow(qrCheckSQL, id).Scan(&qrCount); err != nil {
		return response.InternalServerError(c, "检查二维码失败")
	}
	if qrCount > 0 {
		return response.BadRequest(c, "该产品下存在二维码，无法删除")
	}

	var outboundCount int
	outboundCheckSQL := "SELECT COUNT(*) FROM outbound_records WHERE product_id = ?"
	if err := database.QueryRow(outboundCheckSQL, id).Scan(&outboundCount); err != nil {
		return response.InternalServerError(c, "检查出库记录失败")
	}
	if outboundCount > 0 {
		return response.BadRequest(c, "该产品下存在出库记录，无法删除")
	}

	deleteSQL := "DELETE FROM products WHERE id = ?"
	result, err := database.Exec(deleteSQL, id)
	if err != nil {
		return response.InternalServerError(c, "删除失败")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return response.InternalServerError(c, "获取删除结果失败")
	}
	if rowsAffected == 0 {
		return response.NotFound(c, "产品不存在")
	}

	return response.Success(c, map[string]string{"message": "删除成功"})
}

// generateProductCode 生成产品编号 PROD-YYYYMMDD-XXX
func generateProductCode(db *sql.DB) (string, error) {
	now := time.Now()
	dateStr := now.Format("20060102")
	prefix := fmt.Sprintf("PROD-%s-", dateStr)

	var maxSuffix int
	querySQL := `SELECT COALESCE(MAX(CAST(SUBSTRING(product_code, ?) AS UNSIGNED)), 0) 
		FROM products WHERE product_code LIKE ?`
	prefixLen := len(prefix) + 1
	err := db.QueryRow(querySQL, prefixLen, prefix+"%").Scan(&maxSuffix)
	if err != nil {
		return "", err
	}

	for i := maxSuffix + 1; i <= 999; i++ {
		productCode := fmt.Sprintf("%s%03d", prefix, i)
		var exists int
		checkSQL := "SELECT COUNT(*) FROM products WHERE product_code = ?"
		err := db.QueryRow(checkSQL, productCode).Scan(&exists)
		if err != nil {
			return "", err
		}
		if exists == 0 {
			return productCode, nil
		}
	}

	return "", fmt.Errorf("今日产品编号已用尽")
}
