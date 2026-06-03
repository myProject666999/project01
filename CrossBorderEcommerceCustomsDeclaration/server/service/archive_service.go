package service

import (
	"customs-declaration/model"
	"customs-declaration/repository"
)

type ArchiveService struct {
	ArchiveRepo *repository.ArchiveRepo
}

func NewArchiveService(repo *repository.ArchiveRepo) *ArchiveService {
	return &ArchiveService{ArchiveRepo: repo}
}

func (s *ArchiveService) ListArchives(page, pageSize int) ([]model.CustomsArchive, int64, error) {
	archives, total := s.ArchiveRepo.FindAll(page, pageSize)
	return archives, total, nil
}

func (s *ArchiveService) GetArchive(id uint) (*model.CustomsArchive, error) {
	return s.ArchiveRepo.FindByID(id)
}
