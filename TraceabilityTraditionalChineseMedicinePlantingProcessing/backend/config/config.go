package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBCharset  string
	DBParseTime bool

	ServerHost string
	ServerPort string

	RateLimitPerMinute int
	RateLimitPerHour   int

	QRCodeBaseURL string
}

var AppConfig *Config

func Load() error {
	_ = godotenv.Load()

	AppConfig = &Config{
		DBHost:     getEnv("DB_HOST", "127.0.0.1"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", "123456"),
		DBName:     getEnv("DB_NAME", "tcm_traceability"),
		DBCharset:  getEnv("DB_CHARSET", "utf8mb4"),
		DBParseTime: getEnvAsBool("DB_PARSE_TIME", true),

		ServerHost: getEnv("SERVER_HOST", "0.0.0.0"),
		ServerPort: getEnv("SERVER_PORT", "8080"),

		RateLimitPerMinute: getEnvAsInt("RATE_LIMIT_PER_MINUTE", 30),
		RateLimitPerHour:   getEnvAsInt("RATE_LIMIT_PER_HOUR", 100),

		QRCodeBaseURL: getEnv("QR_CODE_BASE_URL", "http://localhost:8080/scan"),
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value, exists := os.LookupEnv(key); exists {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func GetDSN() string {
	return AppConfig.DBUser + ":" + AppConfig.DBPassword + "@tcp(" + AppConfig.DBHost + ":" + AppConfig.DBPort + ")/" + AppConfig.DBName + "?charset=" + AppConfig.DBCharset + "&parseTime=" + strconv.FormatBool(AppConfig.DBParseTime) + "&loc=Local"
}
