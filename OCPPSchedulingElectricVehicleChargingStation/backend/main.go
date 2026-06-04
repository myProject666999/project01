package main

import (
	"log"

	"github.com/labstack/echo/v4"
	"ocpp-charging/config"
	"ocpp-charging/model"
	"ocpp-charging/router"
)

func main() {
	cfg := config.LoadConfig()

	if err := model.InitDB(&cfg.MySQL); err != nil {
		log.Fatalf("Failed to init database: %v", err)
	}
	defer model.CloseDB()

	if err := model.InitRedis(&cfg.Redis); err != nil {
		log.Printf("Warning: Failed to init Redis: %v", err)
		log.Println("Running without Redis cache...")
	}

	e := echo.New()
	router.SetupRoutes(e)

	log.Printf("Server starting on %s", cfg.Server.Port)
	if err := e.Start(cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
