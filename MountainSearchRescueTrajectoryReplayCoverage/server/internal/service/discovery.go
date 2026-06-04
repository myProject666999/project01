package service

import (
	"mountain-rescue-server/internal/model"
	"mountain-rescue-server/internal/repository"
)

type DiscoveryService struct {
	repo *repository.DiscoveryRepository
}

func NewDiscoveryService(repo *repository.DiscoveryRepository) *DiscoveryService {
	return &DiscoveryService{repo: repo}
}

func (s *DiscoveryService) Create(d *model.Discovery) error {
	return s.repo.Create(d)
}

func (s *DiscoveryService) GetByID(id int) (*model.Discovery, error) {
	var d model.Discovery
	if err := s.repo.GetByID(id, &d); err != nil {
		return nil, err
	}
	return &d, nil
}

func (s *DiscoveryService) ListByMission(missionID int) ([]model.Discovery, error) {
	return s.repo.ListByMission(missionID)
}

func (s *DiscoveryService) ListByMissionAndType(missionID int, discoveryType string) ([]model.Discovery, error) {
	return s.repo.ListByMissionAndType(missionID, discoveryType)
}

func (s *DiscoveryService) Update(d *model.Discovery) error {
	return s.repo.Update(d)
}

func (s *DiscoveryService) Delete(id int) error {
	return s.repo.Delete(id)
}
