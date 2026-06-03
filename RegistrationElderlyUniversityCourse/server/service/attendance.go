package service

import (
	"server/model"
	"server/repository"
)

type AttendanceService struct {
	attendanceRepo *repository.AttendanceRepository
	enrollmentRepo *repository.EnrollmentRepository
}

func NewAttendanceService(attendanceRepo *repository.AttendanceRepository, enrollmentRepo *repository.EnrollmentRepository) *AttendanceService {
	return &AttendanceService{attendanceRepo: attendanceRepo, enrollmentRepo: enrollmentRepo}
}

type AttendanceWithCourse struct {
	model.Attendance
	Course model.Course `json:"course"`
}

func (s *AttendanceService) MyAttendance(userID uint, month string) ([]AttendanceWithCourse, error) {
	attendances, err := s.attendanceRepo.ListByUserIDAndMonth(userID, month)
	if err != nil {
		return nil, err
	}
	result := make([]AttendanceWithCourse, 0)
	for _, a := range attendances {
		enrollment, err := s.enrollmentRepo.FindByID(a.EnrollmentID)
		if err != nil {
			continue
		}
		result = append(result, AttendanceWithCourse{
			Attendance: a,
			Course:     enrollment.Course,
		})
	}
	return result, nil
}

func (s *AttendanceService) Stats(userID uint) (map[string]int64, error) {
	stats, err := s.attendanceRepo.StatsByUserID(userID)
	if err != nil {
		return nil, err
	}
	if stats == nil {
		stats = make(map[string]int64)
	}
	if _, ok := stats["present"]; !ok {
		stats["present"] = 0
	}
	if _, ok := stats["absent"]; !ok {
		stats["absent"] = 0
	}
	if _, ok := stats["leave"]; !ok {
		stats["leave"] = 0
	}
	return stats, nil
}
