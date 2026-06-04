package models

import (
	"antique-auction/config"
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() error {
	var err error
	DB, err = sql.Open("mysql", config.AppConfig.Database.DSN())
	if err != nil {
		return err
	}

	DB.SetMaxIdleConns(config.AppConfig.Database.MaxIdleConns)
	DB.SetMaxOpenConns(config.AppConfig.Database.MaxOpenConns)

	if err = DB.Ping(); err != nil {
		return err
	}

	log.Println("Database connected successfully")
	return nil
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}
