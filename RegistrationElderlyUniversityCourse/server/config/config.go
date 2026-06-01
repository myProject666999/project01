package config

type Config struct {
	MySQL  MySQLConfig
	Redis  RedisConfig
	JWT    JWTConfig
	Server ServerConfig
}

type MySQLConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

type RedisConfig struct {
	Addr string
}

type JWTConfig struct {
	Secret string
}

type ServerConfig struct {
	Port int
}

func Load() *Config {
	return &Config{
		MySQL: MySQLConfig{
			Host:     "127.0.0.1",
			Port:     3306,
			User:     "root",
			Password: "123456",
			DBName:   "elderly_university",
		},
		Redis: RedisConfig{
			Addr: "localhost:6379",
		},
		JWT: JWTConfig{
			Secret: "elderly-university-secret-2024",
		},
		Server: ServerConfig{
			Port: 8180,
		},
	}
}
