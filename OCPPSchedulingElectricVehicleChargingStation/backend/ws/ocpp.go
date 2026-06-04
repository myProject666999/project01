package ws

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"ocpp-charging/model"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type OCPPMessage struct {
	MessageType int         `json:"type"`
	MessageID   string      `json:"messageId"`
	Action      string      `json:"action,omitempty"`
	Payload     interface{} `json:"payload"`
}

type Connection struct {
	Conn      *websocket.Conn
	CPSerial  string
	SendMutex sync.Mutex
}

var (
	connections = make(map[string]*Connection)
	connMutex   sync.RWMutex
)

func HandleOCPPWebSocket(w http.ResponseWriter, r *http.Request) {
	cpSerial := r.URL.Query().Get("cpSerial")
	if cpSerial == "" {
		http.Error(w, "cpSerial required", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	ocppConn := &Connection{
		Conn:     conn,
		CPSerial: cpSerial,
	}

	connMutex.Lock()
	connections[cpSerial] = ocppConn
	connMutex.Unlock()

	updateChargePointOnline(cpSerial, true)
	log.Printf("Charge point %s connected", cpSerial)

	go handleMessages(ocppConn)
}

func handleMessages(conn *Connection) {
	defer func() {
		conn.Conn.Close()
		connMutex.Lock()
		delete(connections, conn.CPSerial)
		connMutex.Unlock()
		updateChargePointOnline(conn.CPSerial, false)
		log.Printf("Charge point %s disconnected", conn.CPSerial)
	}()

	conn.Conn.SetReadLimit(512 * 1024)
	conn.Conn.SetPongHandler(func(string) error {
		conn.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := conn.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error for %s: %v", conn.CPSerial, err)
			}
			break
		}

		var msg []interface{}
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("Invalid OCPP message from %s: %v", conn.CPSerial, err)
			continue
		}

		processOCPPMessage(conn, msg)
	}
}

func processOCPPMessage(conn *Connection, msg []interface{}) {
	if len(msg) < 3 {
		log.Println("Invalid OCPP message format")
		return
	}

	messageType := int(msg[0].(float64))
	messageID := msg[1].(string)

	switch messageType {
	case 2:
		action := msg[2].(string)
		payload := msg[3]
		handleCall(conn, messageID, action, payload)
	case 3:
		handleCallResult(conn, messageID, msg[2])
	case 4:
		log.Printf("Error from %s: %v", conn.CPSerial, msg)
	}
}

func handleCall(conn *Connection, messageID, action string, payload interface{}) {
	log.Printf("Received %s from %s: %v", action, conn.CPSerial, payload)

	switch action {
	case "Heartbeat":
		handleHeartbeat(conn, messageID)
	case "StatusNotification":
		handleStatusNotification(conn, messageID, payload)
	case "StartTransaction":
		handleStartTransaction(conn, messageID, payload)
	case "MeterValues":
		handleMeterValues(conn, messageID, payload)
	case "StopTransaction":
		handleStopTransaction(conn, messageID, payload)
	case "BootNotification":
		handleBootNotification(conn, messageID, payload)
	default:
		sendCallResult(conn, messageID, map[string]interface{}{})
	}
}

func handleHeartbeat(conn *Connection, messageID string) {
	now := time.Now()
	model.DB.Exec("UPDATE charge_points SET last_heartbeat_at = ?, is_online = 1 WHERE cp_serial = ?", now, conn.CPSerial)
	sendCallResult(conn, messageID, map[string]interface{}{"currentTime": now.Format(time.RFC3339)})
}

func handleBootNotification(conn *Connection, messageID string, payload interface{}) {
	sendCallResult(conn, messageID, map[string]interface{}{
		"status":            "Accepted",
		"currentTime":       time.Now().Format(time.RFC3339),
		"interval":          30,
	})
}

func handleStatusNotification(conn *Connection, messageID string, payload interface{}) {
	payloadMap, _ := payload.(map[string]interface{})
	connectorID := int(payloadMap["connectorId"].(float64))
	status := payloadMap["status"].(string)
	errorCode := payloadMap["errorCode"].(string)

	model.DB.Exec(`UPDATE charge_points SET status = ?, error_code = ? WHERE cp_serial = ?`, status, errorCode, conn.CPSerial)
	model.DB.Exec(`UPDATE connectors c JOIN charge_points cp ON c.charge_point_id = cp.id 
		SET c.status = ? WHERE cp.cp_serial = ? AND c.connector_id = ?`, status, conn.CPSerial, connectorID)

	updateStationAvailableCount()

	state := &model.ChargePointState{
		CPSerial:        conn.CPSerial,
		Status:          status,
		IsOnline:        true,
		ConnectorID:     connectorID,
		ConnectorStatus: status,
	}
	model.CacheChargePointState(conn.CPSerial, connectorID, state)

	sendCallResult(conn, messageID, map[string]interface{}{})
}

func handleStartTransaction(conn *Connection, messageID string, payload interface{}) {
	payloadMap, _ := payload.(map[string]interface{})
	idTag := payloadMap["idTag"].(string)
	meterStart := payloadMap["meterStart"].(float64)
	connectorID := int(payloadMap["connectorId"].(float64))

	transactionID := generateTransactionID()

	var txID int64
	model.DB.QueryRow(`SELECT id FROM transactions WHERE transaction_id = ?`, transactionID).Scan(&txID)

	if txID == 0 {
		model.DB.Exec(`INSERT INTO transactions (transaction_id, charge_point_id, connector_id, id_tag, start_time, start_meter, status, price_per_kwh)
			SELECT ?, cp.id, c.id, ?, NOW(), ?, 'active', cp.price_per_kwh
			FROM charge_points cp JOIN connectors c ON cp.id = c.charge_point_id
			WHERE cp.cp_serial = ? AND c.connector_id = ?`,
			transactionID, idTag, meterStart, conn.CPSerial, connectorID)
	}

	model.DB.Exec(`UPDATE charge_points SET status = 'Charging' WHERE cp_serial = ?`, conn.CPSerial)
	model.DB.Exec(`UPDATE connectors c JOIN charge_points cp ON c.charge_point_id = cp.id 
		SET c.status = 'Charging' WHERE cp.cp_serial = ? AND c.connector_id = ?`, conn.CPSerial, connectorID)
	updateStationAvailableCount()

	sendCallResult(conn, messageID, map[string]interface{}{
		"transactionId": 1,
		"idTagInfo": map[string]interface{}{
			"status": "Accepted",
		},
	})
}

func handleMeterValues(conn *Connection, messageID string, payload interface{}) {
	payloadMap, _ := payload.(map[string]interface{})
	connectorID := int(payloadMap["connectorId"].(float64))
	transactionID, _ := payloadMap["transactionId"].(float64)
	meterValue := payloadMap["meterValue"].([]interface{})

	for _, mv := range meterValue {
		mvMap := mv.(map[string]interface{})
		sampledValue := mvMap["sampledValue"].([]interface{})
		for _, sv := range sampledValue {
			svMap := sv.(map[string]interface{})
			value := svMap["value"].(string)
			measurand := "Energy.Active.Import.Register"
			unit := "Wh"

			var chargePointID int64
			model.DB.QueryRow("SELECT id FROM charge_points WHERE cp_serial = ?", conn.CPSerial).Scan(&chargePointID)

			model.DB.Exec(`INSERT INTO meter_values (transaction_id, charge_point_id, connector_id_val, value, measurand, unit, recorded_at)
				VALUES (?, ?, ?, ?, ?, ?, NOW())`,
				int(transactionID), chargePointID, connectorID, value, measurand, unit)

			model.DB.Exec(`UPDATE transactions SET consumed_kwh = ? / 1000, amount = (? / 1000) * price_per_kwh 
				WHERE transaction_id = ?`, value, value, fmt.Sprintf("%d", int(transactionID)))
		}
	}

	sendCallResult(conn, messageID, map[string]interface{}{})
}

func handleStopTransaction(conn *Connection, messageID string, payload interface{}) {
	payloadMap, _ := payload.(map[string]interface{})
	transactionID := int(payloadMap["transactionId"].(float64))
	meterStop := payloadMap["meterStop"].(float64)
	reason, _ := payloadMap["reason"].(string)

	model.DB.Exec(`UPDATE transactions SET stop_time = NOW(), stop_meter = ?, status = 'completed', stop_reason = ?
		WHERE id = ?`, meterStop, reason, transactionID)

	model.DB.Exec(`UPDATE charge_points SET status = 'Available' WHERE id = (
		SELECT charge_point_id FROM transactions WHERE id = ?
	)`, transactionID)

	model.DB.Exec(`UPDATE connectors SET status = 'Available' WHERE id = (
		SELECT connector_id FROM transactions WHERE id = ?
	)`, transactionID)
	updateStationAvailableCount()

	sendCallResult(conn, messageID, map[string]interface{}{
		"idTagInfo": map[string]interface{}{
			"status": "Accepted",
		},
	})
}

func sendCallResult(conn *Connection, messageID string, payload interface{}) {
	conn.SendMutex.Lock()
	defer conn.SendMutex.Unlock()

	msg := []interface{}{3, messageID, payload}
	data, _ := json.Marshal(msg)
	conn.Conn.WriteMessage(websocket.TextMessage, data)
}

func SendRemoteStartTransaction(cpSerial string, idTag string) bool {
	connMutex.RLock()
	conn, exists := connections[cpSerial]
	connMutex.RUnlock()

	if !exists {
		return false
	}

	conn.SendMutex.Lock()
	defer conn.SendMutex.Unlock()

	msg := []interface{}{
		2,
		fmt.Sprintf("req-%d", time.Now().UnixNano()),
		"RemoteStartTransaction",
		map[string]interface{}{
			"idTag": idTag,
			"connectorId": 1,
		},
	}
	data, _ := json.Marshal(msg)
	conn.Conn.WriteMessage(websocket.TextMessage, data)
	return true
}

func SendRemoteStopTransaction(cpSerial string, transactionID int) bool {
	connMutex.RLock()
	conn, exists := connections[cpSerial]
	connMutex.RUnlock()

	if !exists {
		return false
	}

	conn.SendMutex.Lock()
	defer conn.SendMutex.Unlock()

	msg := []interface{}{
		2,
		fmt.Sprintf("req-%d", time.Now().UnixNano()),
		"RemoteStopTransaction",
		map[string]interface{}{
			"transactionId": transactionID,
		},
	}
	data, _ := json.Marshal(msg)
	conn.Conn.WriteMessage(websocket.TextMessage, data)
	return true
}

func handleCallResult(conn *Connection, messageID string, payload interface{}) {
	log.Printf("Call result received from %s: %s", conn.CPSerial, messageID)
}

func updateChargePointOnline(cpSerial string, online bool) {
	isOnline := 0
	if online {
		isOnline = 1
	}
	model.DB.Exec("UPDATE charge_points SET is_online = ? WHERE cp_serial = ?", isOnline, cpSerial)
}

func updateStationAvailableCount() {
	model.DB.Exec(`UPDATE stations s SET available_count = (
		SELECT COUNT(*) FROM charge_points cp
		JOIN connectors c ON c.charge_point_id = cp.id
		WHERE cp.station_id = s.id AND cp.status = 'Available' AND c.status = 'Available' AND cp.is_online = 1
	)`)
}

func generateTransactionID() string {
	return fmt.Sprintf("TX%d", time.Now().UnixNano())
}
