package service

import (
	"customs-declaration/model"
	"customs-declaration/repository"
)

type HsCodeService struct {
	HSCodeRepo *repository.HSCodeRepo
}

func NewHsCodeService(repo *repository.HSCodeRepo) *HsCodeService {
	return &HsCodeService{HSCodeRepo: repo}
}

func (s *HsCodeService) ListHsCodes(page, pageSize int, category, keyword string) ([]model.HSCode, int64, error) {
	codes, total := s.HSCodeRepo.FindAll(page, pageSize, category, keyword)
	return codes, total, nil
}

func (s *HsCodeService) GetHsCode(code string) (*model.HSCode, error) {
	return s.HSCodeRepo.FindByCode(code)
}

func (s *HsCodeService) CreateHsCode(hsCode *model.HSCode) error {
	return s.HSCodeRepo.Create(hsCode)
}

func (s *HsCodeService) UpdateHsCode(hsCode *model.HSCode) error {
	return s.HSCodeRepo.Update(hsCode)
}

func (s *HsCodeService) ListMappings(page, pageSize int) ([]model.CategoryMapping, int64, error) {
	mappings, total := s.HSCodeRepo.FindAllMappings(page, pageSize)
	return mappings, total, nil
}

func (s *HsCodeService) CreateMapping(mapping *model.CategoryMapping) error {
	return s.HSCodeRepo.CreateMapping(mapping)
}

func (s *HsCodeService) UpdateMapping(mapping *model.CategoryMapping) error {
	return s.HSCodeRepo.UpdateMapping(mapping)
}

func (s *HsCodeService) DeleteMapping(id uint) error {
	return s.HSCodeRepo.DeleteMapping(id)
}

func (s *HsCodeService) AutoMatch() (int, error) {
	var items []model.OrderItem
	if err := s.HSCodeRepo.DB.Where("hs_matched = ?", false).Find(&items).Error; err != nil {
		return 0, err
	}

	matched := 0
	for _, item := range items {
		mappings, err := s.HSCodeRepo.FindMappingByCategory(item.Category)
		if err != nil {
			continue
		}
		if len(mappings) == 0 {
			continue
		}

		hsCode := mappings[0].HSCode
		if err := s.HSCodeRepo.DB.Model(&model.OrderItem{}).
			Where("id = ?", item.ID).
			Updates(map[string]interface{}{
				"hs_code":    hsCode,
				"hs_matched": true,
			}).Error; err != nil {
			continue
		}
		matched++
	}

	return matched, nil
}

func (s *HsCodeService) ListUnmatchedItems(page, pageSize int) ([]model.OrderItem, int64, error) {
	items, total := s.HSCodeRepo.FindUnmatchedItems(page, pageSize)
	return items, total, nil
}

func (s *HsCodeService) ManualMatch(itemID uint, hsCode string) error {
	return s.HSCodeRepo.DB.Model(&model.OrderItem{}).
		Where("id = ?", itemID).
		Updates(map[string]interface{}{
			"hs_code":    hsCode,
			"hs_matched": true,
		}).Error
}
