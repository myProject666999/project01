package service

import (
	"encoding/json"
	"logistics-final-delivery/internal/model"
	"logistics-final-delivery/internal/repository"
	"logistics-final-delivery/pkg/utils"
)

type LabelService struct {
	repo *repository.Repository
}

func NewLabelService(repo *repository.Repository) *LabelService {
	return &LabelService{repo: repo}
}

type LabelData struct {
	LabelNo        string            `json:"label_no"`
	PackageNo      string            `json:"package_no"`
	Barcode        string            `json:"barcode"`
	BarcodeType    string            `json:"barcode_type"`
	Language       string            `json:"language"`
	Labels         map[string]string `json:"labels"`
	CustomerName   string            `json:"customer_name"`
	CustomerPhone  string            `json:"customer_phone"`
	Address        string            `json:"address"`
	City           string            `json:"city"`
	Country        string            `json:"country"`
	ZipCode        string            `json:"zip_code"`
	Weight         float64           `json:"weight"`
	Goods          string            `json:"goods"`
	WarehouseName  string            `json:"warehouse_name"`
	WarehouseCode  string            `json:"warehouse_code"`
}

func (s *LabelService) GenerateLabel(packageID uint64, lang string) (*LabelData, error) {
	pkg, err := s.repo.GetPackageByID(packageID)
	if err != nil {
		return nil, err
	}

	label, err := s.repo.GetLabelByPackageID(packageID)
	if err != nil {
		return nil, err
	}

	if lang == "" {
		lang = pkg.Language
	}

	var labelData map[string]interface{}
	if err := json.Unmarshal([]byte(label.LabelData), &labelData); err != nil {
		labelData = make(map[string]interface{})
	}

	weight := 0.0
	if pkg.Weight != nil {
		weight = *pkg.Weight
	}

	warehouseName := ""
	warehouseCode := ""
	if pkg.Warehouse != nil {
		warehouseName = pkg.Warehouse.Name
		warehouseCode = pkg.Warehouse.Code
	}

	result := &LabelData{
		LabelNo:       label.LabelNo,
		PackageNo:     pkg.PackageNo,
		Barcode:       label.Barcode,
		BarcodeType:   label.BarcodeType,
		Language:      lang,
		Labels: map[string]string{
			"tracking_number": utils.GetLabel("tracking_number", lang),
			"recipient":       utils.GetLabel("recipient", lang),
			"address":         utils.GetLabel("address", lang),
			"phone":           utils.GetLabel("phone", lang),
			"weight":          utils.GetLabel("weight", lang),
			"warehouse":       utils.GetLabel("warehouse", lang),
			"fragile":         utils.GetLabel("fragile", lang),
			"scan_to_track":   utils.GetLabel("scan_to_track", lang),
		},
		CustomerName:  pkg.Customer.Name,
		CustomerPhone: pkg.Customer.Phone,
		Address:       pkg.Customer.Address,
		City:          pkg.Customer.City,
		Country:       pkg.Customer.Country,
		ZipCode:       pkg.Customer.ZipCode,
		Weight:        weight,
		Goods:         pkg.GoodsDescription,
		WarehouseName: warehouseName,
		WarehouseCode: warehouseCode,
	}

	return result, nil
}

func (s *LabelService) GetLabelImage(packageID uint64) ([]byte, error) {
	pkg, err := s.repo.GetPackageByID(packageID)
	if err != nil {
		return nil, err
	}

	barcodeBytes, err := utils.GenerateCode128(pkg.PackageNo, 400, 100)
	if err != nil {
		return nil, err
	}

	return barcodeBytes, nil
}

func (s *LabelService) GetQRCodeImage(packageNo string) ([]byte, error) {
	qrBytes, err := utils.GenerateQRCode(packageNo, 200)
	if err != nil {
		return nil, err
	}

	return qrBytes, nil
}

func (s *LabelService) MarkAsPrinted(labelID uint64) error {
	label, err := s.repo.GetLabelByID(labelID)
	if err != nil {
		return err
	}

	label.Printed = 1
	label.PrintedAt = nil

	return s.repo.UpdateLabel(label)
}

func (s *LabelService) GetLabelByPackage(packageID uint64) (*model.Label, error) {
	return s.repo.GetLabelByPackageID(packageID)
}
