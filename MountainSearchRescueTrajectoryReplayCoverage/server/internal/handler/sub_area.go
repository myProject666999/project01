package handler

import (
	"mountain-rescue-server/internal/model"
	"mountain-rescue-server/internal/service"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type SubAreaHandler struct {
	service *service.SubAreaService
}

func NewSubAreaHandler(service *service.SubAreaService) *SubAreaHandler {
	return &SubAreaHandler{service: service}
}

func (h *SubAreaHandler) Create(c echo.Context) error {
	var sa model.SubArea
	if err := c.Bind(&sa); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if err := h.service.Create(&sa); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, sa)
}

func (h *SubAreaHandler) GetByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	sa, err := h.service.GetByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "sub area not found"})
	}
	return c.JSON(http.StatusOK, sa)
}

func (h *SubAreaHandler) ListByMission(c echo.Context) error {
	missionID, err := strconv.Atoi(c.Param("missionId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid mission id"})
	}
	subAreas, err := h.service.ListByMission(missionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, subAreas)
}

func (h *SubAreaHandler) Update(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	var sa model.SubArea
	if err := c.Bind(&sa); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	sa.ID = id
	if err := h.service.Update(&sa); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, sa)
}

func (h *SubAreaHandler) Delete(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	if err := h.service.Delete(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
