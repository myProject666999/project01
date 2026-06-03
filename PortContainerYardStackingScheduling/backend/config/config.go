package config

import (
	"fmt"
)

type Config struct {
	MySQL MySQLConfig
	Redis RedisConfig
	Server ServerConfig
	Yard  YardConfig
}

type MySQLConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

type RedisConfig struct {
	Host string
	Port int
	DB   int
}

type ServerConfig struct {
	Port int
}

type YardConfig struct {
	Bays  int
	Rows  int
	Tiers int
}

func (m MySQLConfig) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=true&loc=Local",
		m.User, m.Password, m.Host, m.Port, m.DBName)
}

func Load() *Config {
	return &Config{
		MySQL: MySQLConfig{
			Host:     "127.0.0.1",
			Port:     3306,
			User:     "root",
			Password: "123456",
			DBName:   "yard_scheduling",
		},
		Redis: RedisConfig{
			Host: "127.0.0.1",
			Port: 6379,
			DB:   0,
		},
		Server: ServerConfig{
			Port: 8088,
		},
		Yard: YardConfig{
			Bays:  10,
			Rows:  6,
			Tiers: 5,
		},
	}
}
