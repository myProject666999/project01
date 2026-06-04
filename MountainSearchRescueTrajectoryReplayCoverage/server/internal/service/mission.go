package service

import (
	"mountain-rescue-server/internal/model"
	"mountain-rescue-server/internal/repository"
)

type MissionService struct {
	repo *repository.MissionRepository
}

func NewMissionService(repo *repository.MissionRepository) *MissionService {
	return &MissionService{repo: repo}
}

func (s *MissionService) Create(m *model.Mission) error {
	return s.repo.Create(m)
}

func (s *MissionService) GetByID(id int) (*model.Mission, error) {
	var m model.Mission
	if err := s.repo.GetByID(id, &m); err != nil {
		return nil, err
	}
	return &m, nil
}

func (s *MissionService) List() ([]model.Mission, error) {
	return s.repo.List()
}

func (s *MissionService) Update(m *model.Mission) error {
	return s.repo.Update(m)
}

func (s *MissionService) Delete(id int) error {
	return s.repo.Delete(id)
}
