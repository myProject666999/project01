package service

import (
	"context"
	"errors"
	"fmt"
	"server/model"
	"server/repository"
	"strconv"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type EnrollmentService struct {
	enrollmentRepo *repository.EnrollmentRepository
	courseRepo     *repository.CourseRepository
	waitlistRepo   *repository.WaitlistRepository
	rdb            *redis.Client
}

func NewEnrollmentService(
	enrollmentRepo *repository.EnrollmentRepository,
	courseRepo *repository.CourseRepository,
	waitlistRepo *repository.WaitlistRepository,
	rdb *redis.Client,
) *EnrollmentService {
	return &EnrollmentService{
		enrollmentRepo: enrollmentRepo,
		courseRepo:     courseRepo,
		waitlistRepo:   waitlistRepo,
		rdb:            rdb,
	}
}

func (s *EnrollmentService) Enroll(userID, courseID uint) (*model.Enrollment, error) {
	ctx := context.Background()

	_, err := s.enrollmentRepo.FindByUserAndCourse(userID, courseID)
	if err == nil {
		return nil, errors.New("已报名该课程")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	enrollmentCount, err := s.rdb.SCard(ctx, fmt.Sprintf("user:enrollments:%d", userID)).Result()
	if err != nil {
		return nil, err
	}
	if enrollmentCount >= 3 {
		return nil, errors.New("已达到最大选课数(3门)")
	}

	result, err := s.rdb.Decr(ctx, fmt.Sprintf("course:stock:%d", courseID)).Result()
	if err != nil {
		return nil, err
	}

	if result < 0 {
		s.rdb.Incr(ctx, fmt.Sprintf("course:stock:%d", courseID))

		position, _ := s.waitlistRepo.CountByCourseID(courseID)
		s.rdb.RPush(ctx, fmt.Sprintf("course:waitlist:%d", courseID), strconv.FormatUint(uint64(userID), 10))

		waitlist := &model.Waitlist{
			UserID:   userID,
			CourseID: courseID,
			Position: int(position) + 1,
			Status:   1,
		}
		if err := s.waitlistRepo.Create(waitlist); err != nil {
			s.rdb.LRem(ctx, fmt.Sprintf("course:waitlist:%d", courseID), 1, strconv.FormatUint(uint64(userID), 10))
			return nil, err
		}
		return nil, errors.New("课程已满，已加入候补列表")
	}

	enrollment := &model.Enrollment{
		UserID:   userID,
		CourseID: courseID,
		Status:   1,
	}
	if err := s.enrollmentRepo.Create(enrollment); err != nil {
		s.rdb.Incr(ctx, fmt.Sprintf("course:stock:%d", courseID))
		return nil, err
	}

	s.rdb.SAdd(ctx, fmt.Sprintf("user:enrollments:%d", userID), strconv.FormatUint(uint64(courseID), 10))
	s.courseRepo.IncrementEnrolled(courseID)

	return enrollment, nil
}

func (s *EnrollmentService) Drop(userID, enrollmentID uint) error {
	enrollment, err := s.enrollmentRepo.FindByID(enrollmentID)
	if err != nil {
		return errors.New("报名记录不存在")
	}
	if enrollment.UserID != userID {
		return errors.New("无权操作")
	}
	if enrollment.Status != 1 {
		return errors.New("该报名已退课")
	}

	ctx := context.Background()

	if err := s.enrollmentRepo.UpdateStatus(enrollmentID, 0); err != nil {
		return err
	}

	s.rdb.SRem(ctx, fmt.Sprintf("user:enrollments:%d", userID), strconv.FormatUint(uint64(enrollment.CourseID), 10))
	s.courseRepo.DecrementEnrolled(enrollment.CourseID)
	s.rdb.Incr(ctx, fmt.Sprintf("course:stock:%d", enrollment.CourseID))

	waitlistedUserIDStr, err := s.rdb.LPop(ctx, fmt.Sprintf("course:waitlist:%d", enrollment.CourseID)).Result()
	if err == nil {
		promotedUserID, parseErr := strconv.ParseUint(waitlistedUserIDStr, 10, 64)
		if parseErr == nil {
			s.promoteWaitlistedUser(ctx, uint(promotedUserID), enrollment.CourseID)
		}
	}

	return nil
}

func (s *EnrollmentService) promoteWaitlistedUser(ctx context.Context, userID, courseID uint) {
	enrollmentCount, err := s.rdb.SCard(ctx, fmt.Sprintf("user:enrollments:%d", userID)).Result()
	if err != nil || enrollmentCount >= 3 {
		nextUserStr, err := s.rdb.LPop(ctx, fmt.Sprintf("course:waitlist:%d", courseID)).Result()
		if err == nil {
			nextUserID, parseErr := strconv.ParseUint(nextUserStr, 10, 64)
			if parseErr == nil {
				s.promoteWaitlistedUser(ctx, uint(nextUserID), courseID)
			}
		}
		return
	}

	result, err := s.rdb.Decr(ctx, fmt.Sprintf("course:stock:%d", courseID)).Result()
	if err != nil || result < 0 {
		s.rdb.Incr(ctx, fmt.Sprintf("course:stock:%d", courseID))
		return
	}

	enrollment := &model.Enrollment{
		UserID:   userID,
		CourseID: courseID,
		Status:   1,
	}
	if err := s.enrollmentRepo.Create(enrollment); err != nil {
		s.rdb.Incr(ctx, fmt.Sprintf("course:stock:%d", courseID))
		return
	}

	s.rdb.SAdd(ctx, fmt.Sprintf("user:enrollments:%d", userID), strconv.FormatUint(uint64(courseID), 10))
	s.waitlistRepo.UpdateStatus(userID, courseID, 0)
	s.courseRepo.IncrementEnrolled(courseID)
}

func (s *EnrollmentService) MyEnrollments(userID uint) ([]model.Enrollment, error) {
	return s.enrollmentRepo.ListByUserID(userID)
}

func (s *EnrollmentService) Schedule(userID uint) ([]model.Enrollment, error) {
	return s.enrollmentRepo.ListScheduleByUserID(userID)
}
