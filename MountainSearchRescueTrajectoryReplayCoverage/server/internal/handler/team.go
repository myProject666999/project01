package handler

import (
	"mountain-rescue-server/internal/model"
	"mountain-rescue-server/internal/service"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type TeamHandler struct {
	service *service.TeamService
}

func NewTeamHandler(service *service.TeamService) *TeamHandler {
	return &TeamHandler{service: service}
}

func (h *TeamHandler) CreateTeam(c echo.Context) error {
	var t model.RescueTeam
	if err := c.Bind(&t); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if err := h.service.CreateTeam(&t); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, t)
}

func (h *TeamHandler) GetTeamByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	t, err := h.service.GetTeamByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "team not found"})
	}
	return c.JSON(http.StatusOK, t)
}

func (h *TeamHandler) ListTeams(c echo.Context) error {
	teams, err := h.service.ListTeams()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, teams)
}

func (h *TeamHandler) UpdateTeam(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	var t model.RescueTeam
	if err := c.Bind(&t); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	t.ID = id
	if err := h.service.UpdateTeam(&t); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, t)
}

func (h *TeamHandler) DeleteTeam(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	if err := h.service.DeleteTeam(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *TeamHandler) CreateMember(c echo.Context) error {
	var m model.Member
	if err := c.Bind(&m); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if err := h.service.CreateMember(&m); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, m)
}

func (h *TeamHandler) GetMemberByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	m, err := h.service.GetMemberByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "member not found"})
	}
	return c.JSON(http.StatusOK, m)
}

func (h *TeamHandler) ListMembers(c echo.Context) error {
	members, err := h.service.ListMembers()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, members)
}

func (h *TeamHandler) ListMembersByTeam(c echo.Context) error {
	teamID, err := strconv.Atoi(c.Param("teamId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid team id"})
	}
	members, err := h.service.ListMembersByTeam(teamID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, members)
}

func (h *TeamHandler) UpdateMember(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	var m model.Member
	if err := c.Bind(&m); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	m.ID = id
	if err := h.service.UpdateMember(&m); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, m)
}

func (h *TeamHandler) DeleteMember(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	if err := h.service.DeleteMember(id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
