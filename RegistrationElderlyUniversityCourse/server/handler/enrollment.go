package handler

import (
	"net/http"
	"server/service"
	"strconv"

	"github.com/labstack/echo/v4"
)

type EnrollmentHandler struct {
	enrollmentService *service.EnrollmentService
}

func NewEnrollmentHandler(enrollmentService *service.EnrollmentService) *EnrollmentHandler {
	return &EnrollmentHandler{enrollmentService: enrollmentService}
}

type EnrollRequest struct {
	CourseID uint `json:"course_id"`
}

func (h *EnrollmentHandler) Enroll(c echo.Context) error {
	userID := GetUserID(c)
	req := new(EnrollRequest)
	if err := c.Bind(req); err != nil {
		return Error(c, http.StatusBadRequest, "请求参数错误")
	}
	if req.CourseID == 0 {
		return Error(c, http.StatusBadRequest, "课程ID不能为空")
	}
	enrollment, err := h.enrollmentService.Enroll(userID, req.CourseID)
	if err != nil {
		return Error(c, http.StatusBadRequest, err.Error())
	}
	return Success(c, enrollment)
}

func (h *EnrollmentHandler) Drop(c echo.Context) error {
	userID := GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return Error(c, http.StatusBadRequest, "无效的报名ID")
	}
	if err := h.enrollmentService.Drop(userID, uint(id)); err != nil {
		return Error(c, http.StatusBadRequest, err.Error())
	}
	return Success(c, nil)
}

func (h *EnrollmentHandler) MyEnrollments(c echo.Context) error {
	userID := GetUserID(c)
	enrollments, err := h.enrollmentService.MyEnrollments(userID)
	if err != nil {
		return Error(c, http.StatusInternalServerError, err.Error())
	}
	return Success(c, enrollments)
}

func (h *EnrollmentHandler) Schedule(c echo.Context) error {
	userID := GetUserID(c)
	enrollments, err := h.enrollmentService.Schedule(userID)
	if err != nil {
		return Error(c, http.StatusInternalServerError, err.Error())
	}
	return Success(c, enrollments)
}
