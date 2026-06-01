package router

import (
	"server/config"
	"server/handler"
	"server/middleware"

	"github.com/labstack/echo/v4"
)

type Handlers struct {
	Auth         *handler.AuthHandler
	Course       *handler.CourseHandler
	Enrollment   *handler.EnrollmentHandler
	Waitlist     *handler.WaitlistHandler
	Attendance   *handler.AttendanceHandler
	Club         *handler.ClubHandler
	Announcement *handler.AnnouncementHandler
	Activity     *handler.ActivityHandler
}

func Setup(e *echo.Echo, cfg *config.Config, h *Handlers) {
	e.Use(middleware.CORSMiddleware())

	auth := e.Group("/api/auth")
	auth.POST("/register", h.Auth.Register)
	auth.POST("/login", h.Auth.Login)

	protected := e.Group("/api")
	protected.Use(middleware.JWTMiddleware(cfg))
	protected.GET("/auth/profile", h.Auth.Profile)

	courses := protected.Group("/courses")
	courses.GET("", h.Course.List)
	courses.GET("/:id", h.Course.GetByID)

	enrollments := protected.Group("/enrollments")
	enrollments.POST("", h.Enrollment.Enroll)
	enrollments.DELETE("/:id", h.Enrollment.Drop)
	enrollments.GET("/my", h.Enrollment.MyEnrollments)
	enrollments.GET("/schedule", h.Enrollment.Schedule)

	waitlist := protected.Group("/waitlist")
	waitlist.GET("/my", h.Waitlist.MyWaitlist)
	waitlist.GET("/position/:courseId", h.Waitlist.GetPosition)

	attendance := protected.Group("/attendance")
	attendance.GET("/my", h.Attendance.MyAttendance)
	attendance.GET("/stats", h.Attendance.Stats)

	clubs := protected.Group("/clubs")
	clubs.GET("", h.Club.List)
	clubs.POST("/:id/join", h.Club.Join)
	clubs.GET("/my", h.Club.MyClubs)

	activities := protected.Group("/activities")
	activities.GET("", h.Activity.List)
	activities.POST("/:id/register", h.Activity.Register)

	protected.GET("/announcements", h.Announcement.List)
}
