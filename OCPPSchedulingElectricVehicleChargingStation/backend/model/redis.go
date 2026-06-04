package model

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"ocpp-charging/config"
)

var RedisClient *redis.Client
var Ctx = context.Background()

func InitRedis(cfg *config.RedisConfig) error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	if err := RedisClient.Ping(Ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to Redis: %v", err)
	}

	return nil
}

func GetChargePointStateKey(cpSerial string, connectorID int) string {
	return fmt.Sprintf("cp_state:%s:%d", cpSerial, connectorID)
}

func GetReservationKey(connectorID int64) string {
	return fmt.Sprintf("reservation:connector:%d", connectorID)
}

func GetCurrentTransactionKey(cpSerial string, connectorID int) string {
	return fmt.Sprintf("current_tx:%s:%d", cpSerial, connectorID)
}

func CacheChargePointState(cpSerial string, connectorID int, state *ChargePointState) error {
	key := GetChargePointStateKey(cpSerial, connectorID)
	stateJSON, _ := json.Marshal(state)
	return RedisClient.Set(Ctx, key, stateJSON, 24*time.Hour).Err()
}

func GetChargePointState(cpSerial string, connectorID int) (*ChargePointState, error) {
	key := GetChargePointStateKey(cpSerial, connectorID)
	result, err := RedisClient.Get(Ctx, key).Result()
	if err != nil {
		return nil, err
	}
	var state ChargePointState
	err = json.Unmarshal([]byte(result), &state)
	return &state, err
}

func TryReserveConnector(connectorID int64, userID int64, ttl time.Duration) (bool, error) {
	key := GetReservationKey(connectorID)
	success, err := RedisClient.SetNX(Ctx, key, userID, ttl).Result()
	return success, err
}

func ReleaseReservation(connectorID int64) error {
	key := GetReservationKey(connectorID)
	return RedisClient.Del(Ctx, key).Err()
}

func GetReservationHolder(connectorID int64) (int64, error) {
	key := GetReservationKey(connectorID)
	result, err := RedisClient.Get(Ctx, key).Int64()
	if err == redis.Nil {
		return 0, nil
	}
	return result, err
}
