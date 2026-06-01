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
