package service

import (
	"customs-declaration/model"
	"customs-declaration/repository"
	"time"
)

type TariffService struct {
	TariffRepo *repository.TariffRepo
}

func NewTariffService(repo *repository.TariffRepo) *TariffService {
	return &TariffService{TariffRepo: repo}
}

func (s *TariffService) ListTariffs(page, pageSize int, paymentStatus, startDate, endDate string) ([]model.TariffRecord, int64, error) {
	records, total := s.TariffRepo.FindAll(page, pageSize, paymentStatus, startDate, endDate)
	return records, total, nil
}

func (s *TariffService) GetTariff(id uint) (*model.TariffRecord, error) {
	return s.TariffRepo.FindByID(id)
}

func (s *TariffService) PayTariff(id uint) error {
	record, err := s.TariffRepo.FindByID(id)
	if err != nil {
		return err
	}
	now := time.Now()
	record.PaymentStatus = "paid"
	record.PaymentDate = &now
	return s.TariffRepo.Update(record)
}

func (s *TariffService) GetStatistics(startDate, endDate string) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	var totalAmount float64
	var paidAmount float64
	var unpaidAmount float64
	var totalCount int64
	var paidCount int64
	var unpaidCount int64

	query := s.TariffRepo.DB.Model(&model.TariffRecord{})
	if startDate != "" {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("created_at <= ?", endDate)
	}

	query.Count(&totalCount)
	query.Select("COALESCE(SUM(tariff_amount), 0)").Scan(&totalAmount)

	s.TariffRepo.DB.Model(&model.TariffRecord{}).Where("payment_status = ?", "paid").Count(&paidCount)
	s.TariffRepo.DB.Model(&model.TariffRecord{}).Where("payment_status = ?", "paid").Select("COALESCE(SUM(tariff_amount), 0)").Scan(&paidAmount)

	s.TariffRepo.DB.Model(&model.TariffRecord{}).Where("payment_status = ?", "unpaid").Count(&unpaidCount)
	s.TariffRepo.DB.Model(&model.TariffRecord{}).Where("payment_status = ?", "unpaid").Select("COALESCE(SUM(tariff_amount), 0)").Scan(&unpaidAmount)

	stats["total_count"] = totalCount
	stats["total_amount"] = totalAmount
	stats["paid_count"] = paidCount
	stats["paid_amount"] = paidAmount
	stats["unpaid_count"] = unpaidCount
	stats["unpaid_amount"] = unpaidAmount

	return stats, nil
}
