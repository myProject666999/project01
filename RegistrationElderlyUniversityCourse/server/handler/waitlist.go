package handler

import (
	"net/http"
	"server/service"
	"strconv"

	"github.com/labstack/echo/v4"
)

type WaitlistHandler struct {
	waitlistService *service.WaitlistService
}

func NewWaitlistHandler(waitlistService *service.WaitlistService) *WaitlistHandler {
	return &WaitlistHandler{waitlistService: waitlistService}
}

func (h *WaitlistHandler) MyWaitlist(c echo.Context) error {
	userID := GetUserID(c)
	waitlists, err := h.waitlistService.MyWaitlist(userID)
	if err != nil {
		return Error(c, http.StatusInternalServerError, err.Error())
	}
	return Success(c, waitlists)
}

func (h *WaitlistHandler) GetPosition(c echo.Context) error {
	userID := GetUserID(c)
	courseID, err := strconv.ParseUint(c.Param("courseId"), 10, 64)
	if err != nil {
		return Error(c, http.StatusBadRequest, "无效的课程ID")
	}
	position, err := h.waitlistService.GetPosition(userID, uint(courseID))
	if err != nil {
		return Error(c, http.StatusNotFound, err.Error())
	}
	return Success(c, map[string]interface{}{
		"position": position,
	})
}
