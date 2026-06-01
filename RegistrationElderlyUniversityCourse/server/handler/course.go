package handler

import (
	"net/http"
	"server/service"
	"strconv"

	"github.com/labstack/echo/v4"
)

type CourseHandler struct {
	courseService *service.CourseService
}

func NewCourseHandler(courseService *service.CourseService) *CourseHandler {
	return &CourseHandler{courseService: courseService}
}

func (h *CourseHandler) List(c echo.Context) error {
	category := c.QueryParam("category")
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))
	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 10
	}
	courses, total, err := h.courseService.List(category, page, pageSize)
	if err != nil {
		return Error(c, http.StatusInternalServerError, err.Error())
	}
	return Success(c, map[string]interface{}{
		"list":  courses,
		"total": total,
		"page":  page,
		"pageSize": pageSize,
	})
}

func (h *CourseHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return Error(c, http.StatusBadRequest, "无效的课程ID")
	}
	course, err := h.courseService.GetByID(uint(id))
	if err != nil {
		return Error(c, http.StatusNotFound, "课程不存在")
	}
	return Success(c, course)
}
