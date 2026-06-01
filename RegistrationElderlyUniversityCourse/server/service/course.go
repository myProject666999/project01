package service

import (
	"server/model"
	"server/repository"
)

type CourseService struct {
	courseRepo *repository.CourseRepository
}

func NewCourseService(courseRepo *repository.CourseRepository) *CourseService {
	return &CourseService{courseRepo: courseRepo}
}

func (s *CourseService) List(category string, page, pageSize int) ([]model.Course, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize
	return s.courseRepo.List(category, offset, pageSize)
}

func (s *CourseService) GetByID(id uint) (*model.Course, error) {
	return s.courseRepo.FindByID(id)
}

func (s *CourseService) FindAll() ([]model.Course, error) {
	return s.courseRepo.FindAll()
}
