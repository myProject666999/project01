package handler

import (
	"net/http"
	"server/database"
	"server/model"
	"strconv"

	"github.com/labstack/echo/v4"
)

type AnnouncementHandler struct{}

func NewAnnouncementHandler() *AnnouncementHandler {
	return &AnnouncementHandler{}
}

func (h *AnnouncementHandler) List(c echo.Context) error {
	var announcements []model.Announcement
	if err := database.DB.Order("created_at DESC").Find(&announcements).Error; err != nil {
		return Error(c, http.StatusInternalServerError, "获取公告列表失败")
	}
	return Success(c, announcements)
}

type ActivityHandler struct{}

func NewActivityHandler() *ActivityHandler {
	return &ActivityHandler{}
}

func (h *ActivityHandler) List(c echo.Context) error {
	var activities []model.Activity
	if err := database.DB.Preload("Club").Order("created_at DESC").Find(&activities).Error; err != nil {
		return Error(c, http.StatusInternalServerError, "获取活动列表失败")
	}
	return Success(c, activities)
}

func (h *ActivityHandler) Register(c echo.Context) error {
	userID := GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return Error(c, http.StatusBadRequest, "无效的活动ID")
	}

	var activity model.Activity
	if err := database.DB.First(&activity, uint(id)).Error; err != nil {
		return Error(c, http.StatusNotFound, "活动不存在")
	}

	var existing model.ActivityRegistration
	if err := database.DB.Where("user_id = ? AND activity_id = ?", userID, uint(id)).First(&existing).Error; err == nil {
		return Error(c, http.StatusBadRequest, "已报名该活动")
	}

	if activity.Capacity > 0 && activity.RegisteredCount >= activity.Capacity {
		return Error(c, http.StatusBadRequest, "活动人数已满")
	}

	registration := &model.ActivityRegistration{
		UserID:     userID,
		ActivityID: uint(id),
	}
	if err := database.DB.Create(registration).Error; err != nil {
		return Error(c, http.StatusInternalServerError, "报名失败")
	}

	database.DB.Model(&model.Activity{}).Where("id = ?", uint(id)).
		UpdateColumn("registered_count", activity.RegisteredCount+1)

	return Success(c, registration)
}
