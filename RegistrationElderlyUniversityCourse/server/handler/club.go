package handler

import (
	"net/http"
	"server/service"
	"strconv"

	"github.com/labstack/echo/v4"
)

type ClubHandler struct {
	clubService *service.ClubService
}

func NewClubHandler(clubService *service.ClubService) *ClubHandler {
	return &ClubHandler{clubService: clubService}
}

func (h *ClubHandler) List(c echo.Context) error {
	clubs, err := h.clubService.List()
	if err != nil {
		return Error(c, http.StatusInternalServerError, err.Error())
	}
	return Success(c, clubs)
}

func (h *ClubHandler) Join(c echo.Context) error {
	userID := GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return Error(c, http.StatusBadRequest, "无效的社团ID")
	}
	member, err := h.clubService.Join(userID, uint(id))
	if err != nil {
		return Error(c, http.StatusBadRequest, err.Error())
	}
	return Success(c, member)
}

func (h *ClubHandler) MyClubs(c echo.Context) error {
	userID := GetUserID(c)
	clubs, err := h.clubService.MyClubs(userID)
	if err != nil {
		return Error(c, http.StatusInternalServerError, err.Error())
	}
	return Success(c, clubs)
}
