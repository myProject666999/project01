package config

type Config struct {
	MySQL MySQLConfig
	Redis RedisConfig
}

type MySQLConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DB       string
}

type RedisConfig struct {
	Host string
	Port string
}

func Load() *Config {
	return &Config{
		MySQL: MySQLConfig{
			Host:     "127.0.0.1",
			Port:     "3306",
			User:     "root",
			Password: "123456",
			DB:       "mountain_rescue",
		},
		Redis: RedisConfig{
			Host: "localhost",
			Port: "6379",
		},
	}
}
