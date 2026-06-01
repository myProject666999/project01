package main

import (
	"context"
	"fmt"
	"log"
	"server/config"
	"server/database"
	"server/handler"
	"server/model"
	"server/repository"
	"server/router"
	"server/service"
	"strconv"

	"golang.org/x/crypto/bcrypt"

	"github.com/labstack/echo/v4"
)

func main() {
	cfg := config.Load()

	if err := database.InitMySQL(cfg.MySQL); err != nil {
		log.Fatalf("MySQL连接失败: %v", err)
	}
	log.Println("MySQL连接成功")

	if err := database.InitRedis(cfg.Redis); err != nil {
		log.Fatalf("Redis连接失败: %v", err)
	}
	log.Println("Redis连接成功")

	database.DB.AutoMigrate(
		&model.User{},
		&model.Course{},
		&model.Enrollment{},
		&model.Waitlist{},
		&model.Attendance{},
		&model.Club{},
		&model.ClubMember{},
		&model.Activity{},
		&model.ActivityRegistration{},
		&model.Announcement{},
	)
	log.Println("数据库迁移完成")

	hashPlaintextPasswords()

	syncRedisStock()

	userRepo := repository.NewUserRepository(database.DB)
	courseRepo := repository.NewCourseRepository(database.DB)
	enrollmentRepo := repository.NewEnrollmentRepository(database.DB)
	waitlistRepo := repository.NewWaitlistRepository(database.DB)
	attendanceRepo := repository.NewAttendanceRepository(database.DB)
	clubRepo := repository.NewClubRepository(database.DB)

	authService := service.NewAuthService(userRepo, cfg)
	courseService := service.NewCourseService(courseRepo)
	enrollmentService := service.NewEnrollmentService(enrollmentRepo, courseRepo, waitlistRepo, database.RDB)
	waitlistService := service.NewWaitlistService(waitlistRepo, database.RDB)
	attendanceService := service.NewAttendanceService(attendanceRepo, enrollmentRepo)
	clubService := service.NewClubService(clubRepo)

	handlers := &router.Handlers{
		Auth:         handler.NewAuthHandler(authService),
		Course:       handler.NewCourseHandler(courseService),
		Enrollment:   handler.NewEnrollmentHandler(enrollmentService),
		Waitlist:     handler.NewWaitlistHandler(waitlistService),
		Attendance:   handler.NewAttendanceHandler(attendanceService),
		Club:         handler.NewClubHandler(clubService),
		Announcement: handler.NewAnnouncementHandler(),
		Activity:     handler.NewActivityHandler(),
	}

	e := echo.New()
	router.Setup(e, cfg, handlers)

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("服务启动在 %s", addr)
	e.Logger.Fatal(e.Start(addr))
}

func syncRedisStock() {
	ctx := context.Background()
	courseRepo := repository.NewCourseRepository(database.DB)
	courses, err := courseRepo.FindAll()
	if err != nil {
		log.Printf("同步Redis库存失败: %v", err)
		return
	}

	for _, course := range courses {
		stock := course.Capacity - course.EnrolledCount
		if stock < 0 {
			stock = 0
		}
		key := fmt.Sprintf("course:stock:%d", course.ID)
		database.RDB.Set(ctx, key, stock, 0)
	}

	var enrollments []model.Enrollment
	database.DB.Where("status = ?", 1).Find(&enrollments)
	for _, e := range enrollments {
		key := fmt.Sprintf("user:enrollments:%d", e.UserID)
		database.RDB.SAdd(ctx, key, strconv.FormatUint(uint64(e.CourseID), 10))
	}

	log.Printf("已同步 %d 门课程的库存到Redis", len(courses))
}

func hashPlaintextPasswords() {
	var users []model.User
	database.DB.Find(&users)
	for _, u := range users {
		if len(u.Password) < 20 {
			hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
			if err == nil {
				database.DB.Model(&model.User{}).Where("id = ?", u.ID).Update("password", string(hashed))
			}
		}
	}
}
