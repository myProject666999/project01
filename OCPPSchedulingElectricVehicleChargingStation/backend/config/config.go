package config

type Config struct {
	Server ServerConfig
	MySQL  MySQLConfig
	Redis  RedisConfig
	JWT    JWTConfig
}

type ServerConfig struct {
	Port string
}

type MySQLConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Database string
}

type RedisConfig struct {
	Host     string
	Port     int
	Password string
	DB       int
}

type JWTConfig struct {
	Secret      string
	ExpireHours int
}

func LoadConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Port: ":8080",
		},
		MySQL: MySQLConfig{
			Host:     "127.0.0.1",
			Port:     3306,
			User:     "root",
			Password: "123456",
			Database: "ocpp_charging",
		},
		Redis: RedisConfig{
			Host:     "127.0.0.1",
			Port:     6379,
			Password: "",
			DB:       0,
		},
		JWT: JWTConfig{
			Secret:      "ocpp-charging-secret-key",
			ExpireHours: 24,
		},
	}
}
