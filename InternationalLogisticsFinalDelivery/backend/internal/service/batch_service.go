package service

import (
	"encoding/json"
	"logistics-final-delivery/internal/model"
	"logistics-final-delivery/internal/repository"
	"logistics-final-delivery/pkg/utils"
	"time"
)

type BatchService struct {
	repo *repository.Repository
}

func NewBatchService(repo *repository.Repository) *BatchService {
	return &BatchService{repo: repo}
}

type CreateBatchRequest struct {
	WarehouseID uint64 `json:"warehouse_id"`
	Remark      string `json:"remark"`
}

type CreateBatchResponse struct {
	BatchID   uint64 `json:"batch_id"`
	BatchNo   string `json:"batch_no"`
	CreatedAt string `json:"created_at"`
}

func (s *BatchService) CreateBatch(req *CreateBatchRequest) (*CreateBatchResponse, error) {
	now := time.Now()
	batch := &model.Batch{
		BatchNo:     utils.GenerateBatchNo(),
		WarehouseID: req.WarehouseID,
		ArrivedAt:   &now,
		Remark:      req.Remark,
		Status:      1,
	}

	if err := s.repo.CreateBatch(batch); err != nil {
		return nil, err
	}

	return &CreateBatchResponse{
		BatchID:   batch.ID,
		BatchNo:   batch.BatchNo,
		CreatedAt: batch.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *BatchService) GetBatch(id uint64) (*model.Batch, error) {
	return s.repo.GetBatchByID(id)
}

func (s *BatchService) ListBatches(page, pageSize int, warehouseID uint64) ([]model.Batch, int64, error) {
	return s.repo.ListBatches(page, pageSize, warehouseID)
}

type AddPackageRequest struct {
	BatchID          uint64  `json:"batch_id"`
	WarehouseID      uint64  `json:"warehouse_id"`
	CustomerName     string  `json:"customer_name"`
	CustomerPhone    string  `json:"customer_phone"`
	CustomerEmail    string  `json:"customer_email"`
	CustomerCountry  string  `json:"customer_country"`
	CustomerCity     string  `json:"customer_city"`
	CustomerState    string  `json:"customer_state"`
	CustomerZipCode  string  `json:"customer_zip_code"`
	CustomerAddress  string  `json:"customer_address"`
	Weight           float64 `json:"weight"`
	Length           float64 `json:"length"`
	Width            float64 `json:"width"`
	Height           float64 `json:"height"`
	GoodsDescription string  `json:"goods_description"`
	DeclaredValue    float64 `json:"declared_value"`
	Currency         string  `json:"currency"`
	Language         string  `json:"language"`
}

type AddPackageResponse struct {
	PackageID uint64 `json:"package_id"`
	PackageNo string `json:"package_no"`
	LabelNo   string `json:"label_no"`
	Barcode   string `json:"barcode"`
}

func (s *BatchService) AddPackage(req *AddPackageRequest) (*AddPackageResponse, error) {
	customer, err := s.repo.GetCustomerByPhone(req.CustomerPhone)
	if err != nil || customer == nil {
		customer = &model.Customer{
			CustomerNo: utils.GenerateCustomerNo(),
			Name:       req.CustomerName,
			Phone:      req.CustomerPhone,
			Email:      req.CustomerEmail,
			Country:    req.CustomerCountry,
			City:       req.CustomerCity,
			State:      req.CustomerState,
			ZipCode:    req.CustomerZipCode,
			Address:    req.CustomerAddress,
		}
		if err := s.repo.CreateCustomer(customer); err != nil {
			return nil, err
		}
	} else {
		customer.Name = req.CustomerName
		customer.Email = req.CustomerEmail
		customer.Country = req.CustomerCountry
		customer.City = req.CustomerCity
		customer.State = req.CustomerState
		customer.ZipCode = req.CustomerZipCode
		customer.Address = req.CustomerAddress
		if err := s.repo.UpdateCustomer(customer); err != nil {
			return nil, err
		}
	}

	packageNo := utils.GeneratePackageNo()
	pkg := &model.Package{
		PackageNo:        packageNo,
		BatchID:          req.BatchID,
		CustomerID:       customer.ID,
		WarehouseID:      req.WarehouseID,
		Weight:           &req.Weight,
		Length:           &req.Length,
		Width:            &req.Width,
		Height:           &req.Height,
		GoodsDescription: req.GoodsDescription,
		DeclaredValue:    &req.DeclaredValue,
		Currency:         req.Currency,
		Language:         req.Language,
		Status:           1,
	}

	if err := s.repo.CreatePackage(pkg); err != nil {
		return nil, err
	}

	labelNo := utils.GenerateLabelNo()
	barcode := packageNo

	labelData := map[string]interface{}{
		"package_no":     packageNo,
		"label_no":       labelNo,
		"customer_name":  req.CustomerName,
		"customer_phone": req.CustomerPhone,
		"address":        req.CustomerAddress,
		"city":           req.CustomerCity,
		"country":        req.CustomerCountry,
		"zip_code":       req.CustomerZipCode,
		"weight":         req.Weight,
		"goods":          req.GoodsDescription,
		"language":       req.Language,
	}
	labelDataJSON, _ := json.Marshal(labelData)

	label := &model.Label{
		PackageID:   pkg.ID,
		LabelNo:     labelNo,
		Barcode:     barcode,
		BarcodeType: "CODE128",
		Language:    req.Language,
		LabelData:   string(labelDataJSON),
	}

	if err := s.repo.CreateLabel(label); err != nil {
		return nil, err
	}

	batch, err := s.repo.GetBatchByID(req.BatchID)
	if err == nil {
		batch.TotalPackages++
		s.repo.UpdateBatch(batch)
	}

	task := &model.DeliveryTask{
		TaskNo:     utils.GenerateTaskNo(),
		PackageID:  pkg.ID,
		CustomerID: customer.ID,
		Status:     1,
		Priority:   3,
	}

	if err := s.repo.CreateDeliveryTask(task); err != nil {
		return nil, err
	}

	return &AddPackageResponse{
		PackageID: pkg.ID,
		PackageNo: packageNo,
		LabelNo:   labelNo,
		Barcode:   barcode,
	}, nil
}
