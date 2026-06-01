package handler

import (
	"net/http"
	"strconv"

	"yard-scheduling/model"
	"yard-scheduling/service"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	svc *service.YardService
}

func NewHandler(svc *service.YardService) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) RegisterRoutes(e *echo.Echo) {
	api := e.Group("/api")
	api.GET("/zones", h.ListZones)
	api.GET("/panorama", h.GetPanorama)
	api.GET("/bay/:zoneId/:bay", h.GetBayDetail)
	api.GET("/containers", h.ListContainers)
	api.GET("/container/:no", h.GetContainer)
	api.POST("/container/in", h.ContainerIn)
	api.POST("/container/out", h.ContainerOut)
	api.POST("/recommend", h.RecommendSlot)
	api.GET("/appointments", h.ListAppointments)
	api.POST("/appointment", h.CreateAppointment)
	api.PUT("/appointment/:id/status", h.UpdateAppointmentStatus)
}

func (h *Handler) ListZones(c echo.Context) error {
	zones, err := h.svc.ListZones()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, zones)
}

func (h *Handler) GetPanorama(c echo.Context) error {
	slots, err := h.svc.GetPanorama()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, slots)
}

func (h *Handler) GetBayDetail(c echo.Context) error {
	zoneID, err := strconv.ParseInt(c.Param("zoneId"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid zoneId"})
	}
	bay, err := strconv.ParseInt(c.Param("bay"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid bay"})
	}
	detail, err := h.svc.GetBayDetail(zoneID, bay)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, detail)
}

func (h *Handler) ContainerIn(c echo.Context) error {
	var req model.ContainerInRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if req.ContainerNo == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "container_no is required"})
	}
	result, err := h.svc.ContainerIn(&req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, result)
}

func (h *Handler) ContainerOut(c echo.Context) error {
	var req model.ContainerOutRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if req.ContainerNo == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "container_no is required"})
	}
	result, reshuffles, err := h.svc.ContainerOut(req.ContainerNo)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"container":       result,
		"reshuffle_count": reshuffles,
	})
}

func (h *Handler) RecommendSlot(c echo.Context) error {
	var req model.ContainerInRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	c2 := &model.Container{
		ContainerNo: req.ContainerNo,
		IsDangerous: req.IsDangerous,
		IMOClass:    req.IMOClass,
	}
	if req.DepartureTime != "" {
		rec, err := h.svc.RecommendSlot(c2)
		if err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, rec)
	}
	rec, err := h.svc.RecommendSlot(c2)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, rec)
}

func (h *Handler) ListContainers(c echo.Context) error {
	status := c.QueryParam("status")
	containers, err := h.svc.ListContainers(status)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, containers)
}

func (h *Handler) GetContainer(c echo.Context) error {
	no := c.Param("no")
	container, err := h.svc.GetContainer(no)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	if container == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "container not found"})
	}
	return c.JSON(http.StatusOK, container)
}

func (h *Handler) CreateAppointment(c echo.Context) error {
	var req model.AppointmentRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	result, err := h.svc.CreateAppointment(&req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, result)
}

func (h *Handler) ListAppointments(c echo.Context) error {
	status := c.QueryParam("status")
	appointments, err := h.svc.ListAppointments(status)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, appointments)
}

func (h *Handler) UpdateAppointmentStatus(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	var body struct {
		Status string `json:"status"`
	}
	if err := c.Bind(&body); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if err := h.svc.UpdateAppointmentStatus(id, body.Status); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "ok"})
}
