package service

import (
	"customs-declaration/repository"
)

type DashboardService struct {
	DashboardRepo *repository.DashboardRepo
}

func NewDashboardService(repo *repository.DashboardRepo) *DashboardService {
	return &DashboardService{DashboardRepo: repo}
}

func (s *DashboardService) GetStats() (map[string]interface{}, error) {
	todayDeclared, pendingReview, released, rejected := s.DashboardRepo.GetStats()

	stats := map[string]interface{}{
		"today_declared": todayDeclared,
		"pending_review": pendingReview,
		"released":       released,
		"rejected":       rejected,
	}

	return stats, nil
}

func (s *DashboardService) GetPendingTasks(limit int) ([]map[string]interface{}, error) {
	return s.DashboardRepo.GetPendingTasks(limit)
}

func (s *DashboardService) GetTrend(days int) ([]map[string]interface{}, error) {
	return s.DashboardRepo.GetTrend(days)
}
