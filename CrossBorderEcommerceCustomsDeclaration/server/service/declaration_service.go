package service

import (
	"customs-declaration/model"
	"customs-declaration/repository"
	"fmt"
	"math/rand"
	"time"
)

type DeclarationService struct {
	DeclarationRepo *repository.DeclarationRepo
	OrderRepo       *repository.OrderRepo
	TariffRepo      *repository.TariffRepo
	ArchiveRepo     *repository.ArchiveRepo
}

func NewDeclarationService(declarationRepo *repository.DeclarationRepo, orderRepo *repository.OrderRepo, tariffRepo *repository.TariffRepo, archiveRepo *repository.ArchiveRepo) *DeclarationService {
	return &DeclarationService{
		DeclarationRepo: declarationRepo,
		OrderRepo:       orderRepo,
		TariffRepo:      tariffRepo,
		ArchiveRepo:     archiveRepo,
	}
}

func (s *DeclarationService) ListDeclarations(page, pageSize int, status, startDate, endDate string) ([]model.Declaration, int64, error) {
	declarations, total := s.DeclarationRepo.FindAll(page, pageSize, status, startDate, endDate)
	return declarations, total, nil
}

func (s *DeclarationService) GetDeclaration(id uint) (*model.Declaration, error) {
	return s.DeclarationRepo.FindByID(id)
}

func (s *DeclarationService) CreateDeclaration(orderIDs []uint) (*model.Declaration, error) {
	var declarationItems []model.DeclarationItem
	var declarationOrders []model.DeclarationOrder
	var totalAmount float64
	var totalQuantity int

	for _, orderID := range orderIDs {
		order, err := s.OrderRepo.FindByID(orderID)
		if err != nil {
			return nil, fmt.Errorf("order %d not found: %w", orderID, err)
		}

		for _, item := range order.OrderItems {
			declarationAmount := float64(item.Quantity) * item.UnitPrice
			totalAmount += declarationAmount
			totalQuantity += item.Quantity

			declarationItems = append(declarationItems, model.DeclarationItem{
				ProductName:       item.ProductName,
				HSCode:            item.HSCode,
				Quantity:          item.Quantity,
				UnitPrice:         item.UnitPrice,
				OriginCountry:     item.OriginCountry,
				DeclarationAmount: declarationAmount,
			})
		}

		declarationOrders = append(declarationOrders, model.DeclarationOrder{
			OrderID: orderID,
		})
	}

	declarationNo := fmt.Sprintf("BGD%s%04d", time.Now().Format("20060102150405"), rand.Intn(10000))

	declaration := &model.Declaration{
		DeclarationNo:     declarationNo,
		Status:            "draft",
		TotalAmount:       totalAmount,
		TotalQuantity:     totalQuantity,
		DeclarationItems:  declarationItems,
		DeclarationOrders: declarationOrders,
	}

	if err := s.DeclarationRepo.Create(declaration); err != nil {
		return nil, err
	}

	return declaration, nil
}

func (s *DeclarationService) SubmitDeclaration(id uint) error {
	declaration, err := s.DeclarationRepo.FindByID(id)
	if err != nil {
		return err
	}
	now := time.Now()
	declaration.Status = "submitted"
	declaration.SubmittedAt = &now
	return s.DeclarationRepo.Update(declaration)
}

func (s *DeclarationService) ReviewDeclaration(id uint) error {
	declaration, err := s.DeclarationRepo.FindByID(id)
	if err != nil {
		return err
	}
	now := time.Now()
	declaration.Status = "reviewing"
	declaration.ReviewedAt = &now
	return s.DeclarationRepo.Update(declaration)
}

func (s *DeclarationService) ReleaseDeclaration(id uint) error {
	declaration, err := s.DeclarationRepo.FindByID(id)
	if err != nil {
		return err
	}

	now := time.Now()
	declaration.Status = "released"
	declaration.ReleasedAt = &now
	if err := s.DeclarationRepo.Update(declaration); err != nil {
		return err
	}

	var tariffItems []model.TariffItem
	var totalTariff float64

	for _, item := range declaration.DeclarationItems {
		var hsCode model.HSCode
		if err := s.DeclarationRepo.DB.Where("code = ?", item.HSCode).First(&hsCode).Error; err != nil {
			continue
		}

		taxRate := hsCode.TaxRate
		taxableAmount := item.DeclarationAmount
		taxAmount := taxableAmount * taxRate / 100.0
		totalTariff += taxAmount

		tariffItems = append(tariffItems, model.TariffItem{
			HSCode:        item.HSCode,
			TaxType:       "综合税",
			TaxRate:       taxRate,
			TaxableAmount: taxableAmount,
			TaxAmount:     taxAmount,
		})
	}

	tariffRecord := &model.TariffRecord{
		DeclarationID: declaration.ID,
		DeclarationNo: declaration.DeclarationNo,
		TariffAmount:  totalTariff,
		Currency:      "CNY",
		PaymentStatus: "unpaid",
		TariffItems:   tariffItems,
	}
	if err := s.TariffRepo.Create(tariffRecord); err != nil {
		return err
	}

	archive := &model.CustomsArchive{
		DeclarationID: declaration.ID,
		DeclarationNo: declaration.DeclarationNo,
		ArchiveNo:     fmt.Sprintf("ARC%s%04d", now.Format("20060102150405"), rand.Intn(10000)),
		ArchiveDate:   now,
		DocumentURL:   fmt.Sprintf("/archives/%s.pdf", declaration.DeclarationNo),
		Status:        "archived",
	}
	if err := s.ArchiveRepo.Create(archive); err != nil {
		return err
	}

	return nil
}

func (s *DeclarationService) RejectDeclaration(id uint, reason, rejectType string) error {
	declaration, err := s.DeclarationRepo.FindByID(id)
	if err != nil {
		return err
	}
	declaration.Status = "rejected"
	declaration.RejectReason = reason
	declaration.RejectType = rejectType
	return s.DeclarationRepo.Update(declaration)
}

func (s *DeclarationService) ResubmitDeclaration(id uint) error {
	declaration, err := s.DeclarationRepo.FindByID(id)
	if err != nil {
		return err
	}
	now := time.Now()
	declaration.Status = "submitted"
	declaration.RejectReason = ""
	declaration.RejectType = ""
	declaration.SubmittedAt = &now
	return s.DeclarationRepo.Update(declaration)
}

func (s *DeclarationService) UpdateDeclarationItem(itemID uint, updates map[string]interface{}) error {
	var item model.DeclarationItem
	if err := s.DeclarationRepo.DB.First(&item, itemID).Error; err != nil {
		return err
	}

	if v, ok := updates["product_name"]; ok {
		item.ProductName = v.(string)
	}
	if v, ok := updates["hs_code"]; ok {
		item.HSCode = v.(string)
	}
	if v, ok := updates["quantity"]; ok {
		item.Quantity = v.(int)
	}
	if v, ok := updates["unit_price"]; ok {
		item.UnitPrice = v.(float64)
	}
	if v, ok := updates["origin_country"]; ok {
		item.OriginCountry = v.(string)
	}
	if v, ok := updates["declaration_amount"]; ok {
		item.DeclarationAmount = v.(float64)
	}
	if v, ok := updates["tax_no"]; ok {
		item.TaxNo = v.(string)
	}

	return s.DeclarationRepo.UpdateItem(&item)
}
