package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Database DatabaseConfig `yaml:"database"`
	JWT      JWTConfig      `yaml:"jwt"`
	Upload   UploadConfig   `yaml:"upload"`
}

type ServerConfig struct {
	Port string `yaml:"port"`
	Mode string `yaml:"mode"`
}

type DatabaseConfig struct {
	Host        string `yaml:"host"`
	Port        string `yaml:"port"`
	User        string `yaml:"user"`
	Password    string `yaml:"password"`
	Name        string `yaml:"name"`
	Charset     string `yaml:"charset"`
	MaxIdleConns int   `yaml:"max_idle_conns"`
	MaxOpenConns int   `yaml:"max_open_conns"`
}

type JWTConfig struct {
	Secret      string `yaml:"secret"`
	ExpireHours int    `yaml:"expire_hours"`
}

type UploadConfig struct {
	Path    string `yaml:"path"`
	MaxSize int64  `yaml:"max_size"`
}

var AppConfig *Config

func LoadConfig(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	AppConfig = &Config{}
	err = yaml.Unmarshal(data, AppConfig)
	if err != nil {
		return err
	}

	return nil
}

func (c *DatabaseConfig) DSN() string {
	return c.User + ":" + c.Password + "@tcp(" + c.Host + ":" + c.Port + ")/" + c.Name + "?charset=" + c.Charset + "&parseTime=True&loc=Local"
}
