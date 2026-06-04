package service

import (
	"mountain-rescue-server/internal/model"
	"mountain-rescue-server/internal/repository"
)

type SubAreaService struct {
	repo *repository.SubAreaRepository
}

func NewSubAreaService(repo *repository.SubAreaRepository) *SubAreaService {
	return &SubAreaService{repo: repo}
}

func (s *SubAreaService) Create(sa *model.SubArea) error {
	return s.repo.Create(sa)
}

func (s *SubAreaService) GetByID(id int) (*model.SubArea, error) {
	var sa model.SubArea
	if err := s.repo.GetByID(id, &sa); err != nil {
		return nil, err
	}
	return &sa, nil
}

func (s *SubAreaService) ListByMission(missionID int) ([]model.SubArea, error) {
	return s.repo.ListByMission(missionID)
}

func (s *SubAreaService) Update(sa *model.SubArea) error {
	return s.repo.Update(sa)
}

func (s *SubAreaService) Delete(id int) error {
	return s.repo.Delete(id)
}
