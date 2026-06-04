package main

import (
	"context"
	"database/sql"
	"fmt"
	"mountain-rescue-server/internal/config"
	"mountain-rescue-server/internal/handler"
	"mountain-rescue-server/internal/middleware"
	"mountain-rescue-server/internal/repository"
	"mountain-rescue-server/internal/service"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-redis/redis/v8"
	_ "github.com/go-sql-driver/mysql"
	"github.com/labstack/echo/v4"
)

func main() {
	cfg := config.Load()

	dsnNoDB := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.MySQL.User, cfg.MySQL.Password, cfg.MySQL.Host, cfg.MySQL.Port)
	db, err := sql.Open("mysql", dsnNoDB)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		panic(err)
	}

	if err := initSchema(db, cfg); err != nil {
		panic(err)
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.MySQL.User, cfg.MySQL.Password, cfg.MySQL.Host, cfg.MySQL.Port, cfg.MySQL.DB)
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		panic(err)
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port),
	})
	if err := redisClient.Ping(context.Background()).Err(); err != nil {
		panic(err)
	}
	defer redisClient.Close()

	missionRepo := repository.NewMissionRepository(db)
	subAreaRepo := repository.NewSubAreaRepository(db)
	teamRepo := repository.NewTeamRepository(db)
	gpsRepo := repository.NewGPSRepository(db)
	coverageRepo := repository.NewCoverageRepository(redisClient)
	discoveryRepo := repository.NewDiscoveryRepository(db)

	missionService := service.NewMissionService(missionRepo)
	subAreaService := service.NewSubAreaService(subAreaRepo)
	teamService := service.NewTeamService(teamRepo)
	gpsService := service.NewGPSService(gpsRepo, redisClient)
	coverageService := service.NewCoverageService(subAreaRepo, gpsRepo, coverageRepo)
	discoveryService := service.NewDiscoveryService(discoveryRepo)

	missionHandler := handler.NewMissionHandler(missionService)
	subAreaHandler := handler.NewSubAreaHandler(subAreaService)
	teamHandler := handler.NewTeamHandler(teamService)
	gpsHandler := handler.NewGPSHandler(gpsService)
	coverageHandler := handler.NewCoverageHandler(coverageService)
	discoveryHandler := handler.NewDiscoveryHandler(discoveryService)
	wsHandler := handler.NewWebSocketHandler(gpsService)

	e := echo.New()
	e.Use(middleware.CORS())

	api := e.Group("/api")

	api.GET("/missions", missionHandler.List)
	api.POST("/missions", missionHandler.Create)
	api.GET("/missions/:id", missionHandler.GetByID)
	api.PUT("/missions/:id", missionHandler.Update)
	api.DELETE("/missions/:id", missionHandler.Delete)

	api.GET("/missions/:missionId/sub-areas", subAreaHandler.ListByMission)
	api.POST("/sub-areas", subAreaHandler.Create)
	api.GET("/sub-areas/:id", subAreaHandler.GetByID)
	api.PUT("/sub-areas/:id", subAreaHandler.Update)
	api.DELETE("/sub-areas/:id", subAreaHandler.Delete)

	api.GET("/teams", teamHandler.ListTeams)
	api.POST("/teams", teamHandler.CreateTeam)
	api.GET("/teams/:id", teamHandler.GetTeamByID)
	api.PUT("/teams/:id", teamHandler.UpdateTeam)
	api.DELETE("/teams/:id", teamHandler.DeleteTeam)

	api.GET("/teams/:teamId/members", teamHandler.ListMembersByTeam)
	api.GET("/members", teamHandler.ListMembers)
	api.POST("/members", teamHandler.CreateMember)
	api.GET("/members/:id", teamHandler.GetMemberByID)
	api.PUT("/members/:id", teamHandler.UpdateMember)
	api.DELETE("/members/:id", teamHandler.DeleteMember)

	api.POST("/gps/batch", gpsHandler.BatchInsert)
	api.GET("/gps/mission/:missionId", gpsHandler.GetByMission)
	api.GET("/gps/mission/:missionId/member/:memberId", gpsHandler.GetByMissionAndMember)
	api.GET("/gps/mission/:missionId/latest", gpsHandler.GetLatestByMission)
	api.GET("/gps/mission/:missionId/range", gpsHandler.GetByTimeRange)
	api.GET("/gps/mission/:missionId/cached", gpsHandler.GetCachedPositions)

	api.GET("/coverage/mission/:missionId", coverageHandler.GetCoverage)
	api.GET("/coverage/mission/:missionId/heatmap", coverageHandler.GetHeatmap)

	api.GET("/discoveries/mission/:missionId", discoveryHandler.ListByMission)
	api.POST("/discoveries", discoveryHandler.Create)
	api.GET("/discoveries/:id", discoveryHandler.GetByID)
	api.PUT("/discoveries/:id", discoveryHandler.Update)
	api.DELETE("/discoveries/:id", discoveryHandler.Delete)

	e.GET("/ws/position/:missionId", wsHandler.HandlePosition)

	e.Logger.Fatal(e.Start(":8080"))
}

func initSchema(db *sql.DB, cfg *config.Config) error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = ?", cfg.MySQL.DB).Scan(&count)
	if err != nil {
		return err
	}
	if count == 0 {
		if err := executeSQLFile(db, cfg, true); err != nil {
			return err
		}
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.MySQL.User, cfg.MySQL.Password, cfg.MySQL.Host, cfg.MySQL.Port, cfg.MySQL.DB)
	dbWithDB, err := sql.Open("mysql", dsn)
	if err != nil {
		return err
	}
	defer dbWithDB.Close()

	err = dbWithDB.QueryRow("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ?", cfg.MySQL.DB, "mission").Scan(&count)
	if err != nil {
		return err
	}
	if count == 0 {
		return executeSQLFile(dbWithDB, cfg, false)
	}
	return nil
}

func executeSQLFile(db *sql.DB, cfg *config.Config, createDBOnly bool) error {
	wd, err := os.Getwd()
	if err != nil {
		return err
	}
	var sqlPath string
	if strings.Contains(wd, "server") {
		sqlPath = filepath.Join(wd, "..", "migrations", "001_init.sql")
	} else {
		sqlPath = filepath.Join(wd, "migrations", "001_init.sql")
	}
	content, err := os.ReadFile(sqlPath)
	if err != nil {
		return err
	}

	sqlStr := string(content)
	if createDBOnly {
		statements := strings.Split(sqlStr, ";")
		for _, stmt := range statements {
			stmt = strings.TrimSpace(stmt)
			if strings.HasPrefix(strings.ToUpper(stmt), "CREATE DATABASE") {
				_, err = db.Exec(stmt)
				return err
			}
		}
		return nil
	}

	statements := strings.Split(sqlStr, ";")
	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" || strings.HasPrefix(strings.ToUpper(stmt), "CREATE DATABASE") || strings.HasPrefix(strings.ToUpper(stmt), "USE ") {
			continue
		}
		if _, err := db.Exec(stmt); err != nil {
			return err
		}
	}
	return nil
}
