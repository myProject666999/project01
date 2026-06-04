package handler

import (
	"mountain-rescue-server/internal/model"
	"mountain-rescue-server/internal/service"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
)

type GPSHandler struct {
	service *service.GPSService
}

func NewGPSHandler(service *service.GPSService) *GPSHandler {
	return &GPSHandler{service: service}
}

func (h *GPSHandler) BatchInsert(c echo.Context) error {
	var req model.BatchGPSRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if err := h.service.BatchInsert(req.Points); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, map[string]string{"status": "success", "count": strconv.Itoa(len(req.Points))})
}

func (h *GPSHandler) GetByMission(c echo.Context) error {
	missionID, err := strconv.Atoi(c.Param("missionId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid mission id"})
	}
	points, err := h.service.GetByMission(missionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, points)
}

func (h *GPSHandler) GetByMissionAndMember(c echo.Context) error {
	missionID, err := strconv.Atoi(c.Param("missionId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid mission id"})
	}
	memberID, err := strconv.Atoi(c.Param("memberId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid member id"})
	}
	points, err := h.service.GetByMissionAndMember(missionID, memberID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, points)
}

func (h *GPSHandler) GetLatestByMission(c echo.Context) error {
	missionID, err := strconv.Atoi(c.Param("missionId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid mission id"})
	}
	points, err := h.service.GetLatestByMission(missionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, points)
}

func (h *GPSHandler) GetByTimeRange(c echo.Context) error {
	missionID, err := strconv.Atoi(c.Param("missionId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid mission id"})
	}
	startTimeStr := c.QueryParam("startTime")
	endTimeStr := c.QueryParam("endTime")
	startTime, err := time.Parse(time.RFC3339, startTimeStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid startTime"})
	}
	endTime, err := time.Parse(time.RFC3339, endTimeStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid endTime"})
	}
	points, err := h.service.GetByTimeRange(missionID, startTime, endTime)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, points)
}

func (h *GPSHandler) GetCachedPositions(c echo.Context) error {
	missionID, err := strconv.Atoi(c.Param("missionId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid mission id"})
	}
	positions, err := h.service.GetCachedPositions(missionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, positions)
}
