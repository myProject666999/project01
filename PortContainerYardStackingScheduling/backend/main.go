package main

import (
	"fmt"
	"log"

	"yard-scheduling/config"
	"yard-scheduling/handler"
	"yard-scheduling/middleware"
	"yard-scheduling/repository"
	"yard-scheduling/service"

	"github.com/labstack/echo/v4"
	"github.com/redis/go-redis/v9"
)

func main() {
	cfg := config.Load()

	repo, err := repository.NewRepo(cfg.MySQL)
	if err != nil {
		log.Fatalf("connect mysql: %v", err)
	}
	defer repo.Close()

	rdb := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		DB:   cfg.Redis.DB,
	})

	svc := service.NewYardService(repo, rdb, cfg.Yard)
	if err := svc.InitSlots(); err != nil {
		log.Fatalf("init slots: %v", err)
	}

	e := echo.New()
	e.Use(middleware.CORS())

	h := handler.NewHandler(svc)
	h.RegisterRoutes(e)

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("server starting on %s", addr)
	if err := e.Start(addr); err != nil {
		log.Fatal(err)
	}
}
