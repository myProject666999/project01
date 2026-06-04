package handler

import (
	"mountain-rescue-server/internal/service"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

type WebSocketHandler struct {
	gpsService *service.GPSService
	upgrader   websocket.Upgrader
}

func NewWebSocketHandler(gpsService *service.GPSService) *WebSocketHandler {
	return &WebSocketHandler{
		gpsService: gpsService,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (h *WebSocketHandler) HandlePosition(c echo.Context) error {
	missionID, err := strconv.Atoi(c.Param("missionId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid mission id"})
	}

	conn, err := h.upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer conn.Close()

	h.gpsService.RegisterWebSocket(missionID, conn)
	defer h.gpsService.UnregisterWebSocket(missionID, conn)

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}

	return nil
}
