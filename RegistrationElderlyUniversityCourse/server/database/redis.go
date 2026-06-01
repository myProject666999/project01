package database

import (
	"context"
	"server/config"

	"github.com/redis/go-redis/v9"
)

var RDB *redis.Client

func InitRedis(cfg config.RedisConfig) error {
	RDB = redis.NewClient(&redis.Options{
		Addr: cfg.Addr,
		DB:   0,
	})
	_, err := RDB.Ping(context.Background()).Result()
	if err != nil {
		return err
	}
	return nil
}
