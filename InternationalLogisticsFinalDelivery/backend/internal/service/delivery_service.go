package service

import (
	"encoding/json"
	"logistics-final-delivery/internal/model"
	"logistics-final-delivery/internal/repository"
	"logistics-final-delivery/pkg/utils"
	"time"
)

type DeliveryService struct {
	repo *repository.Repository
}

func NewDeliveryService(repo *repository.Repository) *DeliveryService {
	return &DeliveryService{repo: repo}
}

type CreateRouteRequest struct {
	WarehouseID uint64   `json:"warehouse_id"`
	CourierID   uint64   `json:"courier_id"`
	Name        string   `json:"name"`
	Area        string   `json:"area"`
	TaskIDs     []uint64 `json:"task_ids"`
}

type CreateRouteResponse struct {
	RouteID    uint64 `json:"route_id"`
	RouteNo    string `json:"route_no"`
	TotalTasks int    `json:"total_tasks"`
}

func (s *DeliveryService) CreateRoute(req *CreateRouteRequest) (*CreateRouteResponse, error) {
	routeNo := utils.GenerateRouteNo()
	route := &model.Route{
		RouteNo:     routeNo,
		WarehouseID: req.WarehouseID,
		CourierID:   &req.CourierID,
		Name:        req.Name,
		Area:        req.Area,
		TotalTasks:  len(req.TaskIDs),
		Status:      2,
	}

	if err := s.repo.CreateRoute(route); err != nil {
		return nil, err
	}

	if len(req.TaskIDs) > 0 {
		if err := s.repo.BatchUpdateRoute(req.TaskIDs, route.ID, req.CourierID); err != nil {
			return nil, err
		}
	}

	courier, err := s.repo.GetCourierByID(req.CourierID)
	if err == nil {
		courier.Status = 3
		s.repo.UpdateCourier(courier)
	}

	return &CreateRouteResponse{
		RouteID:    route.ID,
		RouteNo:    routeNo,
		TotalTasks: len(req.TaskIDs),
	}, nil
}

func (s *DeliveryService) GetRoute(id uint64) (*model.Route, error) {
	return s.repo.GetRouteByID(id)
}

func (s *DeliveryService) ListRoutes(page, pageSize int, warehouseID uint64, courierID uint64) ([]model.Route, int64, error) {
	return s.repo.ListRoutes(page, pageSize, warehouseID, courierID)
}

func (s *DeliveryService) StartRoute(routeID uint64) error {
	route, err := s.repo.GetRouteByID(routeID)
	if err != nil {
		return err
	}

	now := time.Now()
	route.Status = 3
	route.ActualStartTime = &now

	return s.repo.UpdateRoute(route)
}

func (s *DeliveryService) CompleteRoute(routeID uint64) error {
	route, err := s.repo.GetRouteByID(routeID)
	if err != nil {
		return err
	}

	now := time.Now()
	route.Status = 4
	route.ActualEndTime = &now

	return s.repo.UpdateRoute(route)
}

func (s *DeliveryService) GetTask(id uint64) (*model.DeliveryTask, error) {
	return s.repo.GetDeliveryTaskByID(id)
}

func (s *DeliveryService) ListPendingTasks(page, pageSize int, warehouseID uint64) ([]model.DeliveryTask, int64, error) {
	return s.repo.ListPendingTasks(page, pageSize, warehouseID)
}

func (s *DeliveryService) ListCourierTasks(courierID uint64, page, pageSize int, status int8) ([]model.DeliveryTask, int64, error) {
	return s.repo.ListDeliveryTasksByCourier(courierID, page, pageSize, status)
}

func (s *DeliveryService) AcceptTask(taskID uint64, courierID uint64) error {
	task, err := s.repo.GetDeliveryTaskByID(taskID)
	if err != nil {
		return err
	}

	task.Status = 2
	task.CourierID = &courierID

	return s.repo.UpdateDeliveryTask(task)
}

func (s *DeliveryService) StartDelivery(taskID uint64) error {
	task, err := s.repo.GetDeliveryTaskByID(taskID)
	if err != nil {
		return err
	}

	task.Status = 3
	task.AttemptCount++
	now := time.Now()
	task.LastAttemptTime = &now

	return s.repo.UpdateDeliveryTask(task)
}

type CompleteDeliveryRequest struct {
	TaskID         uint64  `json:"task_id"`
	CourierID      uint64  `json:"courier_id"`
	PhotoURL       string  `json:"photo_url"`
	SignatureURL   string  `json:"signature_url"`
	SignerName     string  `json:"signer_name"`
	SignerRelation string  `json:"signer_relation"`
	DeliveryNote   string  `json:"delivery_note"`
	Latitude       float64 `json:"latitude"`
	Longitude      float64 `json:"longitude"`
}

func (s *DeliveryService) CompleteDelivery(req *CompleteDeliveryRequest) error {
	task, err := s.repo.GetDeliveryTaskByID(req.TaskID)
	if err != nil {
		return err
	}

	now := time.Now()
	task.Status = 4
	task.ActualDeliveryTime = &now

	if err := s.repo.UpdateDeliveryTask(task); err != nil {
		return err
	}

	if err := s.repo.UpdatePackageStatus(task.PackageID, 4); err != nil {
		return err
	}

	proof := &model.DeliveryProof{
		TaskID:         req.TaskID,
		PackageID:      task.PackageID,
		CourierID:      req.CourierID,
		PhotoURL:       req.PhotoURL,
		SignatureURL:   req.SignatureURL,
		SignerName:     req.SignerName,
		SignerRelation: req.SignerRelation,
		DeliveryNote:   req.DeliveryNote,
		Latitude:       &req.Latitude,
		Longitude:      &req.Longitude,
	}

	if err := s.repo.CreateDeliveryProof(proof); err != nil {
		return err
	}

	if task.RouteID != nil {
		route, err := s.repo.GetRouteByID(*task.RouteID)
		if err == nil {
			route.CompletedTasks++
			if route.CompletedTasks >= route.TotalTasks {
				route.Status = 4
				route.ActualEndTime = &now
			}
			s.repo.UpdateRoute(route)
		}
	}

	courier, err := s.repo.GetCourierByID(req.CourierID)
	if err == nil {
		courier.TotalDeliveries++
		s.repo.UpdateCourier(courier)
	}

	return nil
}

type ReportExceptionRequest struct {
	TaskID        uint64 `json:"task_id"`
	CourierID     uint64 `json:"courier_id"`
	ExceptionType string `json:"exception_type"`
	Description   string `json:"description"`
	PhotoURL      string `json:"photo_url"`
}

type ReportExceptionResponse struct {
	ExceptionID  uint64 `json:"exception_id"`
	HandlingType string `json:"handling_type"`
	Message      string `json:"message"`
}

func (s *DeliveryService) ReportException(req *ReportExceptionRequest) (*ReportExceptionResponse, error) {
	task, err := s.repo.GetDeliveryTaskByID(req.TaskID)
	if err != nil {
		return nil, err
	}

	task.Status = 5
	if err := s.repo.UpdateDeliveryTask(task); err != nil {
		return nil, err
	}

	if err := s.repo.UpdatePackageStatus(task.PackageID, 5); err != nil {
		return nil, err
	}

	var handlingType string
	var nextAttemptTime *time.Time
	now := time.Now()

	switch req.ExceptionType {
	case "reject":
		handlingType = "return_warehouse"
	case "no_one":
		handlingType = "re_deliver"
		nextTime := now.Add(24 * time.Hour)
		nextAttemptTime = &nextTime
	case "wrong_address":
		handlingType = "contact_customer"
	default:
		handlingType = "other"
	}

	exception := &model.DeliveryException{
		TaskID:          req.TaskID,
		PackageID:       task.PackageID,
		CourierID:       req.CourierID,
		ExceptionType:   req.ExceptionType,
		Description:     req.Description,
		PhotoURL:        req.PhotoURL,
		Status:          1,
		HandlingType:    handlingType,
		NextAttemptTime: nextAttemptTime,
	}

	if err := s.repo.CreateDeliveryException(exception); err != nil {
		return nil, err
	}

	var message string
	switch req.ExceptionType {
	case "reject":
		message = "客户拒收，包裹将退回仓库"
	case "no_one":
		message = "无人在家，将在24小时后重新派送"
	case "wrong_address":
		message = "地址错误，请客服联系客户确认地址"
	default:
		message = "异常已记录，请等待处理"
	}

	return &ReportExceptionResponse{
		ExceptionID:  exception.ID,
		HandlingType: handlingType,
		Message:      message,
	}, nil
}

func (s *DeliveryService) GetException(id uint64) (*model.DeliveryException, error) {
	return s.repo.GetDeliveryExceptionByID(id)
}

func (s *DeliveryService) ListExceptions(page, pageSize int, status int8, exceptionType string) ([]model.DeliveryException, int64, error) {
	return s.repo.ListDeliveryExceptions(page, pageSize, status, exceptionType)
}

type HandleExceptionRequest struct {
	ExceptionID    uint64 `json:"exception_id"`
	HandledBy      uint64 `json:"handled_by"`
	HandlingType   string `json:"handling_type"`
	HandlingResult string `json:"handling_result"`
}

func (s *DeliveryService) HandleException(req *HandleExceptionRequest) error {
	exception, err := s.repo.GetDeliveryExceptionByID(req.ExceptionID)
	if err != nil {
		return err
	}

	now := time.Now()
	exception.Status = 3
	exception.HandledBy = &req.HandledBy
	exception.HandledAt = &now
	exception.HandlingType = req.HandlingType
	exception.HandlingResult = req.HandlingResult

	if err := s.repo.UpdateDeliveryException(exception); err != nil {
		return err
	}

	task, err := s.repo.GetDeliveryTaskByID(exception.TaskID)
	if err == nil {
		if req.HandlingType == "re_deliver" {
			task.Status = 1
			s.repo.UpdateDeliveryTask(task)
			s.repo.UpdatePackageStatus(task.PackageID, 1)
		} else if req.HandlingType == "return_warehouse" {
			task.Status = 4
			s.repo.UpdateDeliveryTask(task)
			s.repo.UpdatePackageStatus(task.PackageID, 4)
		}
	}

	return nil
}

func (s *DeliveryService) OptimizeRoute(taskIDs []uint64) ([]uint64, error) {
	var tasks []model.DeliveryTask
	for _, id := range taskIDs {
		task, err := s.repo.GetDeliveryTaskByID(id)
		if err == nil {
			tasks = append(tasks, *task)
		}
	}

	optimizedOrder := make([]uint64, len(tasks))
	for i, task := range tasks {
		optimizedOrder[i] = task.ID
	}

	return optimizedOrder, nil
}

func (s *DeliveryService) ListCouriers(page, pageSize int, status int8) ([]model.Courier, int64, error) {
	return s.repo.ListCouriers(page, pageSize, status)
}

func (s *DeliveryService) GetCourier(id uint64) (*model.Courier, error) {
	return s.repo.GetCourierByID(id)
}

func (s *DeliveryService) ListWarehouses() ([]model.Warehouse, error) {
	return s.repo.ListWarehouses()
}

func (s *DeliveryService) GetPackage(id uint64) (*model.Package, error) {
	return s.repo.GetPackageByID(id)
}

func (s *DeliveryService) ListPackagesByBatch(batchID uint64, page, pageSize int) ([]model.Package, int64, error) {
	return s.repo.ListPackagesByBatch(batchID, page, pageSize)
}
