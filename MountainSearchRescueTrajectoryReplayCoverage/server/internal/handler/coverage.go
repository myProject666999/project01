package handler

import (
	"mountain-rescue-server/internal/service"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type CoverageHandler struct {
	service *service.CoverageService
}

func NewCoverageHandler(service *service.CoverageService) *CoverageHandler {
	return &CoverageHandler{service: service}
}

func (h *CoverageHandler) GetCoverage(c echo.Context) error {
	missionID, err := strconv.Atoi(c.Param("missionId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid mission id"})
	}
	result, err := h.service.CalculateCoverage(missionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, result)
}

func (h *CoverageHandler) GetHeatmap(c echo.Context) error {
	missionID, err := strconv.Atoi(c.Param("missionId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid mission id"})
	}
	heatmap, err := h.service.GenerateHeatmap(missionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, heatmap)
}
