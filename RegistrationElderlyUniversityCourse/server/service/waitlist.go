package service

import (
	"context"
	"fmt"
	"server/model"
	"server/repository"
	"strconv"

	"github.com/redis/go-redis/v9"
)

type WaitlistService struct {
	waitlistRepo *repository.WaitlistRepository
	rdb          *redis.Client
}

func NewWaitlistService(waitlistRepo *repository.WaitlistRepository, rdb *redis.Client) *WaitlistService {
	return &WaitlistService{waitlistRepo: waitlistRepo, rdb: rdb}
}

func (s *WaitlistService) MyWaitlist(userID uint) ([]model.Waitlist, error) {
	return s.waitlistRepo.ListByUserID(userID)
}

func (s *WaitlistService) GetPosition(userID, courseID uint) (int64, error) {
	ctx := context.Background()
	list := s.rdb.LRange(ctx, fmt.Sprintf("course:waitlist:%d", courseID), 0, -1).Val()
	userIDStr := strconv.FormatUint(uint64(userID), 10)
	for i, v := range list {
		if v == userIDStr {
			return int64(i + 1), nil
		}
	}
	return 0, fmt.Errorf("未在候补列表中")
}

func (s *WaitlistService) FindByUserAndCourse(userID, courseID uint) (*model.Waitlist, error) {
	return s.waitlistRepo.FindByUserAndCourse(userID, courseID)
}
