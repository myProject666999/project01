package service

import (
	"errors"
	"server/model"
	"server/repository"
	"time"

	"gorm.io/gorm"
)

type ClubService struct {
	clubRepo *repository.ClubRepository
}

func NewClubService(clubRepo *repository.ClubRepository) *ClubService {
	return &ClubService{clubRepo: clubRepo}
}

func (s *ClubService) List() ([]model.Club, error) {
	return s.clubRepo.List()
}

func (s *ClubService) Join(userID, clubID uint) (*model.ClubMember, error) {
	_, err := s.clubRepo.FindClubMember(userID, clubID)
	if err == nil {
		return nil, errors.New("已加入该社团")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	_, err = s.clubRepo.FindByID(clubID)
	if err != nil {
		return nil, errors.New("社团不存在")
	}

	member := &model.ClubMember{
		UserID:   userID,
		ClubID:   clubID,
		Status:   1,
		JoinedAt: time.Now(),
	}
	if err := s.clubRepo.CreateClubMember(member); err != nil {
		return nil, err
	}
	s.clubRepo.IncrementMember(clubID)
	return member, nil
}

func (s *ClubService) MyClubs(userID uint) ([]model.Club, error) {
	return s.clubRepo.ListClubsByUserID(userID)
}
