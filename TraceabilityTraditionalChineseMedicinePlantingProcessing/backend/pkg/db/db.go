package db

import (
	"database/sql"
	"sync"

	"tcm-traceability/config"

	_ "github.com/go-sql-driver/mysql"
)

var (
	instance *sql.DB
	once     sync.Once
)

func GetDB() (*sql.DB, error) {
	var err error
	once.Do(func() {
		instance, err = sql.Open("mysql", config.GetDSN())
		if err != nil {
			return
		}
		instance.SetMaxOpenConns(100)
		instance.SetMaxIdleConns(10)
		err = instance.Ping()
	})
	return instance, err
}
