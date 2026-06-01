package handler

import (
	"net/http"
	"server/service"

	"github.com/labstack/echo/v4"
)

type AttendanceHandler struct {
	attendanceService *service.AttendanceService
}

func NewAttendanceHandler(attendanceService *service.AttendanceService) *AttendanceHandler {
	return &AttendanceHandler{attendanceService: attendanceService}
}

func (h *AttendanceHandler) MyAttendance(c echo.Context) error {
	userID := GetUserID(c)
	month := c.QueryParam("month")
	result, err := h.attendanceService.MyAttendance(userID, month)
	if err != nil {
		return Error(c, http.StatusInternalServerError, err.Error())
	}
	return Success(c, result)
}

func (h *AttendanceHandler) Stats(c echo.Context) error {
	userID := GetUserID(c)
	stats, err := h.attendanceService.Stats(userID)
	if err != nil {
		return Error(c, http.StatusInternalServerError, err.Error())
	}
	return Success(c, stats)
}
