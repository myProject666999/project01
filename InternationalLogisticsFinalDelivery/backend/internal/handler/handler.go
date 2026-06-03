package handler

import (
	"logistics-final-delivery/internal/config"
	"logistics-final-delivery/internal/service"
	"logistics-final-delivery/pkg/utils"
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	batchService    *service.BatchService
	labelService    *service.LabelService
	deliveryService *service.DeliveryService
	uploadConfig    *config.UploadConfig
}

func NewHandler(batchService *service.BatchService, labelService *service.LabelService, deliveryService *service.DeliveryService, uploadConfig *config.UploadConfig) *Handler {
	return &Handler{
		batchService:    batchService,
		labelService:    labelService,
		deliveryService: deliveryService,
		uploadConfig:    uploadConfig,
	}
}

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func (h *Handler) CreateBatch(c *fiber.Ctx) error {
	var req service.CreateBatchRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid request body"})
	}

	result, err := h.batchService.CreateBatch(&req)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: result})
}

func (h *Handler) GetBatch(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid batch ID"})
	}

	batch, err := h.batchService.GetBatch(id)
	if err != nil {
		return c.Status(404).JSON(Response{Code: 404, Message: "Batch not found"})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: batch})
}

func (h *Handler) ListBatches(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	warehouseID, _ := strconv.ParseUint(c.Query("warehouse_id", "0"), 10, 64)

	batches, total, err := h.batchService.ListBatches(page, pageSize, warehouseID)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"list":  batches,
		"total": total,
		"page":  page,
		"size":  pageSize,
	}})
}

func (h *Handler) AddPackage(c *fiber.Ctx) error {
	var req service.AddPackageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid request body"})
	}

	batchID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err == nil && batchID > 0 {
		req.BatchID = batchID
	}

	if req.BatchID == 0 {
		return c.Status(400).JSON(Response{Code: 400, Message: "Batch ID is required"})
	}

	if req.WarehouseID == 0 {
		batch, err := h.batchService.GetBatch(req.BatchID)
		if err == nil && batch != nil {
			req.WarehouseID = batch.WarehouseID
		}
	}

	if req.Currency == "" {
		req.Currency = "USD"
	}
	if req.Language == "" {
		req.Language = "en"
	}

	result, err := h.batchService.AddPackage(&req)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: result})
}

func (h *Handler) GetPackage(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid package ID"})
	}

	pkg, err := h.deliveryService.GetPackage(id)
	if err != nil {
		return c.Status(404).JSON(Response{Code: 404, Message: "Package not found"})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: pkg})
}

func (h *Handler) ListPackagesByBatch(c *fiber.Ctx) error {
	batchID, err := strconv.ParseUint(c.Params("batch_id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid batch ID"})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))

	packages, total, err := h.deliveryService.ListPackagesByBatch(batchID, page, pageSize)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"list":  packages,
		"total": total,
		"page":  page,
		"size":  pageSize,
	}})
}

func (h *Handler) GenerateLabel(c *fiber.Ctx) error {
	packageID, err := strconv.ParseUint(c.Params("package_id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid package ID"})
	}

	lang := c.Query("lang", "")

	labelData, err := h.labelService.GenerateLabel(packageID, lang)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: labelData})
}

func (h *Handler) GetBarcodeImage(c *fiber.Ctx) error {
	packageID, err := strconv.ParseUint(c.Params("package_id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid package ID"})
	}

	barcodeBytes, err := h.labelService.GetLabelImage(packageID)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	c.Set("Content-Type", "image/png")
	return c.Send(barcodeBytes)
}

func (h *Handler) GetQRCodeImage(c *fiber.Ctx) error {
	packageNo := c.Params("package_no")

	qrBytes, err := h.labelService.GetQRCodeImage(packageNo)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	c.Set("Content-Type", "image/png")
	return c.Send(qrBytes)
}

func (h *Handler) CreateRoute(c *fiber.Ctx) error {
	var req service.CreateRouteRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid request body"})
	}

	result, err := h.deliveryService.CreateRoute(&req)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: result})
}

func (h *Handler) GetRoute(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid route ID"})
	}

	route, err := h.deliveryService.GetRoute(id)
	if err != nil {
		return c.Status(404).JSON(Response{Code: 404, Message: "Route not found"})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: route})
}

func (h *Handler) ListRoutes(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	warehouseID, _ := strconv.ParseUint(c.Query("warehouse_id", "0"), 10, 64)
	courierID, _ := strconv.ParseUint(c.Query("courier_id", "0"), 10, 64)

	routes, total, err := h.deliveryService.ListRoutes(page, pageSize, warehouseID, courierID)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"list":  routes,
		"total": total,
		"page":  page,
		"size":  pageSize,
	}})
}

func (h *Handler) StartRoute(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid route ID"})
	}

	if err := h.deliveryService.StartRoute(id); err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Route started successfully"})
}

func (h *Handler) CompleteRoute(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid route ID"})
	}

	if err := h.deliveryService.CompleteRoute(id); err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Route completed successfully"})
}

func (h *Handler) GetTask(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid task ID"})
	}

	task, err := h.deliveryService.GetTask(id)
	if err != nil {
		return c.Status(404).JSON(Response{Code: 404, Message: "Task not found"})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: task})
}

func (h *Handler) ListPendingTasks(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	warehouseID, _ := strconv.ParseUint(c.Query("warehouse_id", "0"), 10, 64)

	tasks, total, err := h.deliveryService.ListPendingTasks(page, pageSize, warehouseID)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"list":  tasks,
		"total": total,
		"page":  page,
		"size":  pageSize,
	}})
}

func (h *Handler) ListCourierTasks(c *fiber.Ctx) error {
	courierID, err := strconv.ParseUint(c.Params("courier_id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid courier ID"})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	status, _ := strconv.Atoi(c.Query("status", "0"))

	tasks, total, err := h.deliveryService.ListCourierTasks(courierID, page, pageSize, int8(status))
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"list":  tasks,
		"total": total,
		"page":  page,
		"size":  pageSize,
	}})
}

func (h *Handler) StartDelivery(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid task ID"})
	}

	if err := h.deliveryService.StartDelivery(id); err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Delivery started successfully"})
}

func (h *Handler) CompleteDelivery(c *fiber.Ctx) error {
	var req service.CompleteDeliveryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid request body"})
	}

	if err := h.deliveryService.CompleteDelivery(&req); err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Delivery completed successfully"})
}

func (h *Handler) ReportException(c *fiber.Ctx) error {
	var req service.ReportExceptionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid request body"})
	}

	result, err := h.deliveryService.ReportException(&req)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: result})
}

func (h *Handler) GetException(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid exception ID"})
	}

	exception, err := h.deliveryService.GetException(id)
	if err != nil {
		return c.Status(404).JSON(Response{Code: 404, Message: "Exception not found"})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: exception})
}

func (h *Handler) ListExceptions(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	status, _ := strconv.Atoi(c.Query("status", "0"))
	exceptionType := c.Query("type", "")

	exceptions, total, err := h.deliveryService.ListExceptions(page, pageSize, int8(status), exceptionType)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"list":  exceptions,
		"total": total,
		"page":  page,
		"size":  pageSize,
	}})
}

func (h *Handler) HandleException(c *fiber.Ctx) error {
	var req service.HandleExceptionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid request body"})
	}

	if err := h.deliveryService.HandleException(&req); err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Exception handled successfully"})
}

func (h *Handler) UploadPhoto(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "No file uploaded"})
	}

	allowedTypes := []string{".jpg", ".jpeg", ".png", ".gif"}
	filePath, err := utils.SaveUploadedFile(file, h.uploadConfig.PhotoPath, allowedTypes)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	fileName := filepath.Base(filePath)
	url := "/uploads/photos/" + fileName

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"url":      url,
		"filePath": filePath,
	}})
}

func (h *Handler) UploadSignature(c *fiber.Ctx) error {
	var body struct {
		Image string `json:"image"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid request body"})
	}

	filePath, err := utils.SaveBase64Image(body.Image, h.uploadConfig.SignaturePath)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	fileName := filepath.Base(filePath)
	url := "/uploads/signatures/" + fileName

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"url":      url,
		"filePath": filePath,
	}})
}

func (h *Handler) ListCouriers(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	status, _ := strconv.Atoi(c.Query("status", "0"))

	couriers, total, err := h.deliveryService.ListCouriers(page, pageSize, int8(status))
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"list":  couriers,
		"total": total,
		"page":  page,
		"size":  pageSize,
	}})
}

func (h *Handler) GetCourier(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid courier ID"})
	}

	courier, err := h.deliveryService.GetCourier(id)
	if err != nil {
		return c.Status(404).JSON(Response{Code: 404, Message: "Courier not found"})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: courier})
}

func (h *Handler) ListWarehouses(c *fiber.Ctx) error {
	warehouses, err := h.deliveryService.ListWarehouses()
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: warehouses})
}

func (h *Handler) ListPackages(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	keyword := c.Query("keyword", "")

	packages, total, err := h.deliveryService.ListPackages(page, pageSize, keyword)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"list":  packages,
		"total": total,
		"page":  page,
		"size":  pageSize,
	}})
}

func (h *Handler) ListLabels(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	language := c.Query("language", "")

	labels, total, err := h.deliveryService.ListLabels(page, pageSize, language)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"list":  labels,
		"total": total,
		"page":  page,
		"size":  pageSize,
	}})
}

func (h *Handler) ListTasks(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	status, _ := strconv.Atoi(c.Query("status", "0"))

	tasks, total, err := h.deliveryService.ListTasks(page, pageSize, int8(status))
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: fiber.Map{
		"list":  tasks,
		"total": total,
		"page":  page,
		"size":  pageSize,
	}})
}

func (h *Handler) GetTaskByPackage(c *fiber.Ctx) error {
	packageID, err := strconv.ParseUint(c.Params("package_id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid package ID"})
	}

	task, err := h.deliveryService.GetTaskByPackageID(packageID)
	if err != nil {
		return c.Status(404).JSON(Response{Code: 404, Message: "Task not found"})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: task})
}

func (h *Handler) GetTaskProof(c *fiber.Ctx) error {
	taskID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid task ID"})
	}

	proof, err := h.deliveryService.GetProofByTaskID(taskID)
	if err != nil {
		return c.Status(404).JSON(Response{Code: 404, Message: "Proof not found"})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: proof})
}

func (h *Handler) AcceptTask(c *fiber.Ctx) error {
	taskID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid task ID"})
	}

	var body struct {
		CourierID uint64 `json:"courier_id"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid request body"})
	}

	if err := h.deliveryService.AcceptTask(taskID, body.CourierID); err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Task accepted successfully"})
}

func (h *Handler) CompleteDeliveryByTask(c *fiber.Ctx) error {
	taskID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid task ID"})
	}

	var body struct {
		SignedBy     string  `json:"signed_by"`
		DeliveredAt  string  `json:"delivered_at"`
		PhotoURL     string  `json:"photo_url"`
		SignatureURL string  `json:"signature_url"`
		Latitude     float64 `json:"latitude"`
		Longitude    float64 `json:"longitude"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid request body"})
	}

	req := &service.CompleteDeliveryRequest{
		TaskID:         taskID,
		CourierID:      1,
		PhotoURL:       body.PhotoURL,
		SignatureURL:   body.SignatureURL,
		SignerName:     body.SignedBy,
		SignerRelation: "本人",
		Latitude:       body.Latitude,
		Longitude:      body.Longitude,
	}

	if err := h.deliveryService.CompleteDelivery(req); err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Delivery completed successfully"})
}

func (h *Handler) ReportExceptionByTask(c *fiber.Ctx) error {
	taskID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid task ID"})
	}

	var body struct {
		ReportedBy    uint64 `json:"reported_by"`
		ExceptionType string `json:"exception_type"`
		Description   string `json:"description"`
		PhotoURL      string `json:"photo_url"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid request body"})
	}

	req := &service.ReportExceptionRequest{
		TaskID:        taskID,
		CourierID:     body.ReportedBy,
		ExceptionType: body.ExceptionType,
		Description:   body.Description,
		PhotoURL:      body.PhotoURL,
	}

	result, err := h.deliveryService.ReportException(req)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	return c.JSON(Response{Code: 200, Message: "Success", Data: result})
}

func (h *Handler) GetLabelImage(c *fiber.Ctx) error {
	packageID, err := strconv.ParseUint(c.Params("package_id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(Response{Code: 400, Message: "Invalid package ID"})
	}

	lang := c.Query("lang", "en")

	labelData, err := h.labelService.GenerateLabel(packageID, lang)
	if err != nil {
		return c.Status(500).JSON(Response{Code: 500, Message: err.Error()})
	}

	pkg, err := h.deliveryService.GetPackage(packageID)
	if err != nil {
		return c.Status(404).JSON(Response{Code: 404, Message: "Package not found"})
	}

	weight := 0.0
	if pkg.Weight != nil {
		weight = *pkg.Weight
	}

	barcodeURL := "/api/v1/labels/barcode/" + strconv.FormatUint(packageID, 10)
	qrURL := "/api/v1/labels/qrcode/" + labelData.PackageNo

	c.Set("Content-Type", "text/html; charset=utf-8")
	html := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Shipping Label</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .label { border: 2px solid #000; padding: 20px; max-width: 600px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 20px; }
        .label-no { font-size: 14px; color: #666; }
        .row { display: flex; margin-bottom: 8px; font-size: 14px; }
        .key { font-weight: bold; width: 140px; }
        .value { flex: 1; }
        .barcodes { display: flex; justify-content: space-around; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc; }
        .barcode-item { text-align: center; }
        .barcode-label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .barcode-text { font-family: 'Courier New', monospace; font-size: 12px; margin-top: 5px; letter-spacing: 2px; }
        @media print {
            body { padding: 0; }
            .label { border: none; }
        }
    </style>
</head>
<body>
    <div class="label">
        <div class="header">
            <h1>Final Delivery Label</h1>
            <span class="label-no">` + labelData.LabelNo + `</span>
        </div>
        <div class="row"><div class="key">Tracking No:</div><div class="value">` + labelData.PackageNo + `</div></div>
        <div class="row"><div class="key">Recipient:</div><div class="value">` + labelData.CustomerName + `</div></div>
        <div class="row"><div class="key">Phone:</div><div class="value">` + labelData.CustomerPhone + `</div></div>
        <div class="row"><div class="key">Address:</div><div class="value">` + labelData.Address + `</div></div>
        <div class="row"><div class="key">City:</div><div class="value">` + labelData.City + `</div></div>
        <div class="row"><div class="key">Postal Code:</div><div class="value">` + labelData.ZipCode + `</div></div>
        <div class="row"><div class="key">Weight:</div><div class="value">` + strconv.FormatFloat(weight, 'f', 2, 64) + ` kg</div></div>
        <div class="barcodes">
            <div class="barcode-item">
                <div class="barcode-label">CODE128</div>
                <img src="` + barcodeURL + `" style="max-width: 250px;">
                <div class="barcode-text">` + labelData.PackageNo + `</div>
            </div>
            <div class="barcode-item">
                <div class="barcode-label">QR Code</div>
                <img src="` + qrURL + `" style="max-width: 150px;">
            </div>
        </div>
    </div>
    <script>window.print();</script>
</body>
</html>`
	return c.SendString(html)
}
