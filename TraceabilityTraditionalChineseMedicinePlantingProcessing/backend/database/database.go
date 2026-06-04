package database

import (
	"fmt"
	"log"
	"time"

	"tcm-traceability/config"
	"tcm-traceability/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

var DB *gorm.DB

// Init 初始化数据库连接
func Init() error {
	dsn := config.GetDSN()

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NamingStrategy: schema.NamingStrategy{
			SingularTable: false,
		},
		PrepareStmt: true,
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	if err := autoMigrate(); err != nil {
		log.Printf("Warning: auto migration failed: %v", err)
	}

	log.Println("Database connection initialized successfully")
	return nil
}

// autoMigrate 自动迁移数据库表结构
func autoMigrate() error {
	return DB.AutoMigrate(
		&models.Operator{},
		&models.Pesticide{},
		&models.Fertilizer{},
		&models.HerbVariety{},
		&models.Plot{},
		&models.FarmingOperationType{},
		&models.FarmingRecord{},
		&models.HarvestBatch{},
		&models.ProcessingStepType{},
		&models.ProcessingRecord{},
		&models.Product{},
		&models.QRCode{},
		&models.OutboundRecord{},
		&models.ApiAccessLog{},
		&models.IPBlacklist{},
	)
}

// Close 关闭数据库连接
func Close() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err == nil {
			sqlDB.Close()
			log.Println("Database connection closed")
		}
	}
}
