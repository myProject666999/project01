package service

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"ocpp-charging/config"
	"ocpp-charging/middleware"
	"ocpp-charging/model"
	"ocpp-charging/ws"
)

type UserService struct{}

func NewUserService() *UserService {
	return &UserService{}
}

func (s *UserService) Register(phone, password, nickname string) (*model.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	result, err := model.DB.Exec(`INSERT INTO users (phone, password, nickname) VALUES (?, ?, ?)`,
		phone, string(hashedPassword), nickname)
	if err != nil {
		return nil, err
	}

	id, _ := result.LastInsertId()
	return &model.User{ID: id, Phone: phone, Nickname: nickname}, nil
}

func (s *UserService) Login(phone, password string) (string, *model.User, error) {
	var user model.User
	var hashedPassword string
	err := model.DB.QueryRow(`SELECT id, phone, password, nickname, balance FROM users WHERE phone = ?`, phone).
		Scan(&user.ID, &user.Phone, &hashedPassword, &user.Nickname, &user.Balance)
	if err == sql.ErrNoRows {
		return "", nil, errors.New("invalid credentials")
	}
	if err != nil {
		return "", nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)); err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	cfg := config.LoadConfig()
	claims := &middleware.JWTClaims{
		UserID: user.ID,
		Phone:  user.Phone,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(cfg.JWT.ExpireHours) * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString([]byte(cfg.JWT.Secret))
	if err != nil {
		return "", nil, err
	}

	user.Password = ""
	return tokenStr, &user, nil
}

func (s *UserService) GetUser(id int64) (*model.User, error) {
	var user model.User
	err := model.DB.QueryRow(`SELECT id, phone, nickname, balance FROM users WHERE id = ?`, id).
		Scan(&user.ID, &user.Phone, &user.Nickname, &user.Balance)
	return &user, err
}

type StationService struct{}

func NewStationService() *StationService {
	return &StationService{}
}

func (s *StationService) GetAllStations() ([]model.Station, error) {
	rows, err := model.DB.Query(`SELECT id, name, address, latitude, longitude, available_count, total_count, status FROM stations`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stations []model.Station
	for rows.Next() {
		var st model.Station
		rows.Scan(&st.ID, &st.Name, &st.Address, &st.Latitude, &st.Longitude, &st.AvailableCount, &st.TotalCount, &st.Status)
		stations = append(stations, st)
	}
	return stations, nil
}

func (s *StationService) GetChargePoints(stationID int64) ([]model.ChargePoint, error) {
	rows, err := model.DB.Query(`SELECT id, station_id, cp_serial, name, status, error_code, power_kw, price_per_kwh, is_online 
		FROM charge_points WHERE station_id = ?`, stationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cps []model.ChargePoint
	for rows.Next() {
		var cp model.ChargePoint
		rows.Scan(&cp.ID, &cp.StationID, &cp.CPSerial, &cp.Name, &cp.Status, &cp.ErrorCode, &cp.PowerKw, &cp.PricePerKwh, &cp.IsOnline)
		cps = append(cps, cp)
	}
	return cps, nil
}

func (s *StationService) GetConnectorByQR(qrCode string) (*model.Connector, *model.ChargePoint, *model.Station, error) {
	var conn model.Connector
	var cp model.ChargePoint
	var st model.Station

	err := model.DB.QueryRow(`
		SELECT c.id, c.charge_point_id, c.connector_id, c.status, c.qr_code,
		       cp.id, cp.cp_serial, cp.name, cp.status, cp.price_per_kwh, cp.is_online,
		       s.id, s.name, s.address
		FROM connectors c
		JOIN charge_points cp ON c.charge_point_id = cp.id
		JOIN stations s ON cp.station_id = s.id
		WHERE c.qr_code = ?
	`, qrCode).Scan(&conn.ID, &conn.ChargePointID, &conn.ConnectorID, &conn.Status, &conn.QRCode,
		&cp.ID, &cp.CPSerial, &cp.Name, &cp.Status, &cp.PricePerKwh, &cp.IsOnline,
		&st.ID, &st.Name, &st.Address)

	if err == sql.ErrNoRows {
		return nil, nil, nil, errors.New("connector not found")
	}

	return &conn, &cp, &st, err
}

type ChargeService struct{}

func NewChargeService() *ChargeService {
	return &ChargeService{}
}

func (s *ChargeService) ReserveConnector(userID, connectorID int64) (bool, string, error) {
	reserved, err := model.TryReserveConnector(connectorID, userID, 5*time.Minute)
	if err != nil {
		return false, "", err
	}
	if !reserved {
		return false, "桩正在被占用中，请稍后重试", nil
	}

	model.DB.Exec(`INSERT INTO reservations (user_id, connector_id, status, expired_at) VALUES (?, ?, 'reserved', ?)`,
		userID, connectorID, time.Now().Add(5*time.Minute))

	model.DB.Exec(`UPDATE connectors SET status = 'Reserved' WHERE id = ?`, connectorID)

	return true, "占桩成功，请在5分钟内启动充电", nil
}

func (s *ChargeService) StartCharge(userID, connectorID int64) (string, error) {
	holderID, err := model.GetReservationHolder(connectorID)
	if err != nil {
		return "", err
	}
	if holderID == 0 || holderID != userID {
		return "", errors.New("请先扫码占桩")
	}

	var conn model.Connector
	var cp model.ChargePoint
	err = model.DB.QueryRow(`
		SELECT c.id, c.charge_point_id, c.connector_id, cp.cp_serial, cp.price_per_kwh
		FROM connectors c JOIN charge_points cp ON c.charge_point_id = cp.id
		WHERE c.id = ?
	`, connectorID).Scan(&conn.ID, &conn.ChargePointID, &conn.ConnectorID, &cp.CPSerial, &cp.PricePerKwh)
	if err != nil {
		return "", err
	}

	idTag := fmt.Sprintf("USER%d", userID)
	transactionID := fmt.Sprintf("TX%d", time.Now().UnixNano())

	_, err = model.DB.Exec(`INSERT INTO transactions (transaction_id, user_id, charge_point_id, connector_id, id_tag, price_per_kwh, status)
		VALUES (?, ?, ?, ?, ?, ?, 'starting')`,
		transactionID, userID, conn.ChargePointID, connectorID, idTag, cp.PricePerKwh)
	if err != nil {
		return "", err
	}

	ok := ws.SendRemoteStartTransaction(cp.CPSerial, idTag)
	if !ok {
		model.DB.Exec(`UPDATE transactions SET status = 'failed' WHERE transaction_id = ?`, transactionID)
		return "", errors.New("充电桩离线，启动失败")
	}

	model.DB.Exec(`UPDATE transactions SET status = 'active' WHERE transaction_id = ?`, transactionID)
	model.ReleaseReservation(connectorID)
	model.DB.Exec(`UPDATE reservations SET status = 'used' WHERE connector_id = ?`, connectorID)

	return transactionID, nil
}

func (s *ChargeService) StopCharge(userID int64, transactionID string) error {
	var tx model.Transaction
	var cpSerial string
	err := model.DB.QueryRow(`
		SELECT t.id, t.user_id, t.charge_point_id, t.status, cp.cp_serial
		FROM transactions t JOIN charge_points cp ON t.charge_point_id = cp.id
		WHERE t.transaction_id = ?
	`, transactionID).Scan(&tx.ID, &tx.UserID, &tx.ChargePointID, &tx.Status, &cpSerial)

	if err == sql.ErrNoRows {
		return errors.New("transaction not found")
	}
	if tx.UserID != userID {
		return errors.New("not authorized")
	}
	if tx.Status != "active" {
		return errors.New("transaction not active")
	}

	ok := ws.SendRemoteStopTransaction(cpSerial, int(tx.ID))
	if !ok {
		return errors.New("充电桩离线")
	}

	return nil
}

func (s *ChargeService) GetTransactionStatus(transactionID string) (*model.Transaction, error) {
	var tx model.Transaction
	var startTime, stopTime sql.NullTime
	err := model.DB.QueryRow(`
		SELECT id, transaction_id, user_id, start_time, stop_time, consumed_kwh, amount, status
		FROM transactions WHERE transaction_id = ?
	`, transactionID).Scan(&tx.ID, &tx.TransactionID, &tx.UserID, &startTime, &tx.StopTime, &tx.ConsumedKwh, &tx.Amount, &tx.Status)

	if startTime.Valid {
		tx.StartTime = &startTime.Time
	}
	if stopTime.Valid {
		tx.StopTime = &stopTime.Time
	}

	return &tx, err
}

func (s *ChargeService) GetUserTransactions(userID int64) ([]model.Transaction, error) {
	rows, err := model.DB.Query(`
		SELECT id, transaction_id, start_time, stop_time, consumed_kwh, amount, status
		FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var txs []model.Transaction
	for rows.Next() {
		var tx model.Transaction
		var startTime, stopTime sql.NullTime
		rows.Scan(&tx.ID, &tx.TransactionID, &startTime, &stopTime, &tx.ConsumedKwh, &tx.Amount, &tx.Status)
		if startTime.Valid {
			tx.StartTime = &startTime.Time
		}
		if stopTime.Valid {
			tx.StopTime = &stopTime.Time
		}
		txs = append(txs, tx)
	}
	return txs, nil
}

type DashboardService struct{}

func NewDashboardService() *DashboardService {
	return &DashboardService{}
}

func (s *DashboardService) GetRealTimeStats() (map[string]interface{}, error) {
	var totalCP, onlineCP, availableCP, chargingCP int

	model.DB.QueryRow(`SELECT COUNT(*) FROM charge_points`).Scan(&totalCP)
	model.DB.QueryRow(`SELECT COUNT(*) FROM charge_points WHERE is_online = 1`).Scan(&onlineCP)
	model.DB.QueryRow(`SELECT COUNT(*) FROM charge_points WHERE status = 'Available' AND is_online = 1`).Scan(&availableCP)
	model.DB.QueryRow(`SELECT COUNT(*) FROM charge_points WHERE status = 'Charging'`).Scan(&chargingCP)

	var totalUsers, todayActiveUsers int
	model.DB.QueryRow(`SELECT COUNT(*) FROM users`).Scan(&totalUsers)
	model.DB.QueryRow(`SELECT COUNT(DISTINCT user_id) FROM transactions WHERE DATE(created_at) = CURDATE()`).Scan(&todayActiveUsers)

	var todayTransactions, todayKwh, todayRevenue float64
	model.DB.QueryRow(`SELECT COUNT(*), COALESCE(SUM(consumed_kwh), 0), COALESCE(SUM(amount), 0) 
		FROM transactions WHERE DATE(created_at) = CURDATE()`).Scan(&todayTransactions, &todayKwh, &todayRevenue)

	return map[string]interface{}{
		"total_cp":          totalCP,
		"online_cp":         onlineCP,
		"available_cp":      availableCP,
		"charging_cp":       chargingCP,
		"total_users":       totalUsers,
		"today_active_users": todayActiveUsers,
		"today_transactions": int(todayTransactions),
		"today_kwh":         todayKwh,
		"today_revenue":     todayRevenue,
	}, nil
}

func (s *DashboardService) GetAllChargePointsStatus() ([]map[string]interface{}, error) {
	rows, err := model.DB.Query(`
		SELECT cp.id, cp.cp_serial, cp.name, cp.status, cp.is_online, cp.power_kw, cp.last_heartbeat_at,
		       s.name as station_name
		FROM charge_points cp JOIN stations s ON cp.station_id = s.id
		ORDER BY s.id, cp.id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var cpID int64
		var cpSerial, name, status, stationName string
		var isOnline int8
		var powerKw float64
		var lastHeartbeat sql.NullTime

		rows.Scan(&cpID, &cpSerial, &name, &status, &isOnline, &powerKw, &lastHeartbeat, &stationName)

		item := map[string]interface{}{
			"id":               cpID,
			"cp_serial":        cpSerial,
			"name":             name,
			"status":           status,
			"is_online":        isOnline,
			"power_kw":         powerKw,
			"station_name":     stationName,
			"last_heartbeat":   nil,
		}
		if lastHeartbeat.Valid {
			item["last_heartbeat"] = lastHeartbeat.Time
		}
		result = append(result, item)
	}
	return result, nil
}

type PaymentService struct{}

func NewPaymentService() *PaymentService {
	return &PaymentService{}
}

func (s *PaymentService) PayTransaction(userID int64, transactionID string) error {
	var tx model.Transaction
	var user model.User
	var paymentID int64

	err := model.DB.QueryRow(`SELECT id, user_id, amount, status FROM transactions WHERE transaction_id = ?`, transactionID).
		Scan(&tx.ID, &tx.UserID, &tx.Amount, &tx.Status)
	if err != nil {
		return errors.New("transaction not found")
	}
	if tx.UserID != userID {
		return errors.New("not authorized")
	}
	if tx.Status != "completed" {
		return errors.New("transaction not completed")
	}

	model.DB.QueryRow(`SELECT id, balance FROM users WHERE id = ?`, userID).Scan(&user.ID, &user.Balance)
	if user.Balance < tx.Amount {
		return errors.New("balance not enough")
	}

	model.DB.QueryRow(`SELECT id FROM payments WHERE transaction_id = ? AND status = 'completed'`, transactionID).Scan(&paymentID)
	if paymentID > 0 {
		return errors.New("already paid")
	}

	dbTx, err := model.DB.Begin()
	if err != nil {
		return err
	}

	_, err = dbTx.Exec(`UPDATE users SET balance = balance - ? WHERE id = ?`, tx.Amount, userID)
	if err != nil {
		dbTx.Rollback()
		return err
	}

	_, err = dbTx.Exec(`INSERT INTO payments (user_id, transaction_id, amount, pay_method, status, paid_at)
		VALUES (?, ?, ?, 'balance', 'completed', NOW())`, userID, transactionID, tx.Amount)
	if err != nil {
		dbTx.Rollback()
		return err
	}

	return dbTx.Commit()
}

func (s *PaymentService) Recharge(userID int64, amount float64) error {
	_, err := model.DB.Exec(`UPDATE users SET balance = balance + ? WHERE id = ?`, amount, userID)
	return err
}

func (s *PaymentService) GetBalance(userID int64) (float64, error) {
	var balance float64
	err := model.DB.QueryRow(`SELECT balance FROM users WHERE id = ?`, userID).Scan(&balance)
	return balance, err
}
