package handler

import (
	"mountain-rescue-server/internal/model"
	"mountain-rescue-server/internal/service"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type DiscoveryHandler struct {
	service *service.DiscoveryService
}

func NewDiscoveryHandler(service *service.DiscoveryService) *DiscoveryHandler {
	return &DiscoveryHandler{service: service}
}

func (h *DiscoveryHandler) Create(c echo.Context) error {
	var d model.Discovery
	if err := c.Bind(&d); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if err := h.service.Create(&d); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, d)
}

func (h *DiscoveryHandler) GetByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	d, err := h.service.GetByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "discovery not found"})
	}
	return c.JSON(http.StatusOK, d)
}

func (h *DiscoveryHandler) ListByMission(c echo.Context) error {
	missionID, err := strconv.Atoi(c.Param("missionId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid mission id"})
	}
	discoveryType := c.QueryParam("type")
	var discoveries []model.Discovery
	if discoveryType != "" {
		discoveries, err = h.service.ListByMissionAndType(missionID, discoveryType)
	} else {
		discoveries, err = h.service.ListByMission(missionID)
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, discoveries)
}

func (h *DiscoveryHandler) Update(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	var d model.Discovery
	if err := c.Bind(&d); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	d.ID = id
	if err := h.service.Update(&d); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, d)
}

func (h *DiscoveryHandler) Delete(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	if err := h.service.Delete(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
