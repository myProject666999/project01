package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"ocpp-charging/service"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler() *UserHandler {
	return &UserHandler{
		userService: service.NewUserService(),
	}
}

type RegisterRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Nickname string `json:"nickname"`
}

type LoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

func (h *UserHandler) Register(c echo.Context) error {
	var req RegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request"})
	}

	user, err := h.userService.Register(req.Phone, req.Password, req.Nickname)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"user": user})
}

func (h *UserHandler) Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request"})
	}

	token, user, err := h.userService.Login(req.Phone, req.Password)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"token": token, "user": user})
}

func (h *UserHandler) GetProfile(c echo.Context) error {
	userID := c.Get("user_id").(int64)

	user, err := h.userService.GetUser(userID)
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "user not found"})
	}

	return c.JSON(http.StatusOK, echo.Map{"user": user})
}

type StationHandler struct {
	stationService *service.StationService
}

func NewStationHandler() *StationHandler {
	return &StationHandler{
		stationService: service.NewStationService(),
	}
}

func (h *StationHandler) GetAllStations(c echo.Context) error {
	stations, err := h.stationService.GetAllStations()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"stations": stations})
}

func (h *StationHandler) GetChargePoints(c echo.Context) error {
	stationID, _ := strconv.ParseInt(c.Param("station_id"), 10, 64)
	cps, err := h.stationService.GetChargePoints(stationID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"charge_points": cps})
}

func (h *StationHandler) ScanQR(c echo.Context) error {
	type ScanRequest struct {
		QRCode string `json:"qr_code"`
	}
	var req ScanRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request"})
	}

	conn, cp, st, err := h.stationService.GetConnectorByQR(req.QRCode)
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"connector":    conn,
		"charge_point": cp,
		"station":      st,
	})
}

type ChargeHandler struct {
	chargeService *service.ChargeService
}

func NewChargeHandler() *ChargeHandler {
	return &ChargeHandler{
		chargeService: service.NewChargeService(),
	}
}

type ReserveRequest struct {
	ConnectorID int64 `json:"connector_id"`
}

func (h *ChargeHandler) Reserve(c echo.Context) error {
	userID := c.Get("user_id").(int64)
	var req ReserveRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request"})
	}

	success, message, err := h.chargeService.ReserveConnector(userID, req.ConnectorID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"success": success, "message": message})
}

type StartRequest struct {
	ConnectorID int64 `json:"connector_id"`
}

func (h *ChargeHandler) StartCharge(c echo.Context) error {
	userID := c.Get("user_id").(int64)
	var req StartRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request"})
	}

	transactionID, err := h.chargeService.StartCharge(userID, req.ConnectorID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"transaction_id": transactionID})
}

type StopRequest struct {
	TransactionID string `json:"transaction_id"`
}

func (h *ChargeHandler) StopCharge(c echo.Context) error {
	userID := c.Get("user_id").(int64)
	var req StopRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request"})
	}

	err := h.chargeService.StopCharge(userID, req.TransactionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"success": true})
}

func (h *ChargeHandler) GetTransaction(c echo.Context) error {
	transactionID := c.Param("transaction_id")

	tx, err := h.chargeService.GetTransactionStatus(transactionID)
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "transaction not found"})
	}

	return c.JSON(http.StatusOK, echo.Map{"transaction": tx})
}

func (h *ChargeHandler) GetUserTransactions(c echo.Context) error {
	userID := c.Get("user_id").(int64)

	txs, err := h.chargeService.GetUserTransactions(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"transactions": txs})
}

type DashboardHandler struct {
	dashboardService *service.DashboardService
}

func NewDashboardHandler() *DashboardHandler {
	return &DashboardHandler{
		dashboardService: service.NewDashboardService(),
	}
}

func (h *DashboardHandler) GetStats(c echo.Context) error {
	stats, err := h.dashboardService.GetRealTimeStats()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stats)
}

func (h *DashboardHandler) GetChargePoints(c echo.Context) error {
	cps, err := h.dashboardService.GetAllChargePointsStatus()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"charge_points": cps})
}

type PaymentHandler struct {
	paymentService *service.PaymentService
}

func NewPaymentHandler() *PaymentHandler {
	return &PaymentHandler{
		paymentService: service.NewPaymentService(),
	}
}

type PayRequest struct {
	TransactionID string `json:"transaction_id"`
}

func (h *PaymentHandler) Pay(c echo.Context) error {
	userID := c.Get("user_id").(int64)
	var req PayRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request"})
	}

	err := h.paymentService.PayTransaction(userID, req.TransactionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"success": true})
}

type RechargeRequest struct {
	Amount float64 `json:"amount"`
}

func (h *PaymentHandler) Recharge(c echo.Context) error {
	userID := c.Get("user_id").(int64)
	var req RechargeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request"})
	}

	err := h.paymentService.Recharge(userID, req.Amount)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	balance, _ := h.paymentService.GetBalance(userID)

	return c.JSON(http.StatusOK, echo.Map{"success": true, "balance": balance})
}

func (h *PaymentHandler) GetBalance(c echo.Context) error {
	userID := c.Get("user_id").(int64)
	balance, err := h.paymentService.GetBalance(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"balance": balance})
}
