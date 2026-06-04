package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var (
	interrupt = make(chan os.Signal, 1)
)

type ChargePointSimulator struct {
	conn        *websocket.Conn
	cpSerial    string
	connectorID int
	isCharging  bool
	meterValue  float64
	txID        int
	mu          sync.Mutex
}

func NewChargePointSimulator(cpSerial string, connectorID int) *ChargePointSimulator {
	return &ChargePointSimulator{
		cpSerial:    cpSerial,
		connectorID: connectorID,
		meterValue:  10000 + rand.Float64()*5000,
		isCharging:  false,
		txID:        0,
	}
}

func (cp *ChargePointSimulator) Connect() error {
	u := url.URL{
		Scheme:   "ws",
		Host:     "localhost:8080",
		Path:     "/ocpp",
		RawQuery: fmt.Sprintf("cpSerial=%s", cp.cpSerial),
	}

	log.Printf("Connecting to %s", u.String())
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return err
	}
	cp.conn = conn
	return nil
}

func (cp *ChargePointSimulator) SendBootNotification() {
	msg := []interface{}{
		2,
		fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		"BootNotification",
		map[string]interface{}{
			"chargePointVendor":  "Simulator",
			"chargePointModel":   "CP-Sim-v1",
			"chargePointSerial":  cp.cpSerial,
		},
	}
	cp.conn.WriteJSON(msg)
	log.Printf("[%s] Sent BootNotification", cp.cpSerial)
}

func (cp *ChargePointSimulator) SendStatusNotification(status string) {
	msg := []interface{}{
		2,
		fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		"StatusNotification",
		map[string]interface{}{
			"connectorId": cp.connectorID,
			"status":      status,
			"errorCode":   "NoError",
			"info":        "",
			"timestamp":   time.Now().Format(time.RFC3339),
		},
	}
	cp.conn.WriteJSON(msg)
	log.Printf("[%s] Sent StatusNotification: %s", cp.cpSerial, status)
}

func (cp *ChargePointSimulator) SendHeartbeat() {
	msg := []interface{}{
		2,
		fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		"Heartbeat",
		map[string]interface{}{},
	}
	cp.conn.WriteJSON(msg)
	log.Printf("[%s] Sent Heartbeat", cp.cpSerial)
}

func (cp *ChargePointSimulator) SendStartTransaction(idTag string) {
	cp.mu.Lock()
	cp.txID++
	txID := cp.txID
	cp.mu.Unlock()

	msg := []interface{}{
		2,
		fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		"StartTransaction",
		map[string]interface{}{
			"connectorId": cp.connectorID,
			"idTag":       idTag,
			"meterStart":  int(cp.meterValue),
			"timestamp":   time.Now().Format(time.RFC3339),
			"reservationId": nil,
		},
	}
	cp.conn.WriteJSON(msg)
	log.Printf("[%s] Sent StartTransaction, txId=%d", cp.cpSerial, txID)
}

func (cp *ChargePointSimulator) SendMeterValues(transactionID int) {
	cp.mu.Lock()
	if cp.isCharging {
		cp.meterValue += 50 + rand.Float64()*50
	}
	currentMeter := int(cp.meterValue)
	cp.mu.Unlock()

	msg := []interface{}{
		2,
		fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		"MeterValues",
		map[string]interface{}{
			"connectorId":   cp.connectorID,
			"transactionId": transactionID,
			"meterValue": []interface{}{
				map[string]interface{}{
					"timestamp": time.Now().Format(time.RFC3339),
					"sampledValue": []interface{}{
						map[string]interface{}{
							"value":     fmt.Sprintf("%d", currentMeter),
							"context":   "Sample.Periodic",
							"measurand": "Energy.Active.Import.Register",
							"location":  "Outlet",
							"unit":      "Wh",
						},
					},
				},
			},
		},
	}
	cp.conn.WriteJSON(msg)
	log.Printf("[%s] Sent MeterValues: %d Wh", cp.cpSerial, currentMeter)
}

func (cp *ChargePointSimulator) SendStopTransaction(transactionID int, reason string) {
	cp.mu.Lock()
	currentMeter := int(cp.meterValue)
	cp.isCharging = false
	cp.mu.Unlock()

	msg := []interface{}{
		2,
		fmt.Sprintf("msg_%d", time.Now().UnixNano()),
		"StopTransaction",
		map[string]interface{}{
			"idTag":       "USER1",
			"meterStop":   currentMeter,
			"timestamp":   time.Now().Format(time.RFC3339),
			"transactionId": transactionID,
			"reason":      reason,
		},
	}
	cp.conn.WriteJSON(msg)
	log.Printf("[%s] Sent StopTransaction, txId=%d, meter=%d", cp.cpSerial, transactionID, currentMeter)
}

func (cp *ChargePointSimulator) HandleMessage(msg []interface{}) {
	if len(msg) < 2 {
		return
	}

	msgType := int(msg[0].(float64))
	msgID := msg[1].(string)

	if msgType == 2 {
		action := msg[2].(string)
		payload := msg[3].(map[string]interface{})

		switch action {
		case "RemoteStartTransaction":
			idTag := payload["idTag"].(string)
			log.Printf("[%s] Received RemoteStartTransaction: %s", cp.cpSerial, idTag)
			
			cp.SendStatusNotification("Charging")
			cp.mu.Lock()
			cp.isCharging = true
			cp.txID++
			cp.mu.Unlock()
			
			time.Sleep(500 * time.Millisecond)
			cp.SendStartTransaction(idTag)

			cp.SendCallResult(msgID, map[string]interface{}{
				"status": "Accepted",
			})

		case "RemoteStopTransaction":
			transactionID := int(payload["transactionId"].(float64))
			log.Printf("[%s] Received RemoteStopTransaction: txId=%d", cp.cpSerial, transactionID)
			
			cp.SendStopTransaction(transactionID, "Remote")
			
			time.Sleep(500 * time.Millisecond)
			cp.SendStatusNotification("Available")

			cp.SendCallResult(msgID, map[string]interface{}{
				"status": "Accepted",
			})

		default:
			cp.SendCallResult(msgID, map[string]interface{}{})
		}
	}
}

func (cp *ChargePointSimulator) SendCallResult(messageID string, payload interface{}) {
	msg := []interface{}{3, messageID, payload}
	cp.conn.WriteJSON(msg)
}

func (cp *ChargePointSimulator) Run() {
	defer cp.conn.Close()

	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			_, message, err := cp.conn.ReadMessage()
			if err != nil {
				log.Printf("[%s] read error: %v", cp.cpSerial, err)
				return
			}

			var msg []interface{}
			if err := json.Unmarshal(message, &msg); err != nil {
				log.Printf("[%s] parse error: %v", cp.cpSerial, err)
				continue
			}

			cp.HandleMessage(msg)
		}
	}()

	cp.SendBootNotification()
	time.Sleep(500 * time.Millisecond)
	cp.SendStatusNotification("Available")

	heartbeatTicker := time.NewTicker(30 * time.Second)
	meterTicker := time.NewTicker(3 * time.Second)
	defer heartbeatTicker.Stop()
	defer meterTicker.Stop()

	for {
		select {
		case <-done:
			return
		case <-heartbeatTicker.C:
			cp.SendHeartbeat()
		case <-meterTicker.C:
			cp.mu.Lock()
			isCharging := cp.isCharging
			txID := cp.txID
			cp.mu.Unlock()
			if isCharging {
				cp.SendMeterValues(txID)
			}
		case <-interrupt:
			log.Printf("[%s] Interrupt received", cp.cpSerial)
			return
		}
	}
}

func main() {
	signal.Notify(interrupt, os.Interrupt)

	if len(os.Args) < 2 {
		log.Println("Usage: simulator <cpSerial> [connectorID]")
		log.Println("Example: simulator CP-WJ-001 1")
		os.Exit(1)
	}

	cpSerial := os.Args[1]
	connectorID := 1
	if len(os.Args) >= 3 {
		connectorID, _ = strconv.Atoi(os.Args[2])
	}

	cp := NewChargePointSimulator(cpSerial, connectorID)
	if err := cp.Connect(); err != nil {
		log.Fatalf("Connect failed: %v", err)
	}

	cp.Run()
}
