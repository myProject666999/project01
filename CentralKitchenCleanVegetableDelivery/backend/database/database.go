package database

import (
	"central-kitchen/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) error {
	var err error
	DB, err = gorm.Open(mysql.Open(cfg.GetDSN()), &gorm.Config{})
	if err != nil {
		return err
	}
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
