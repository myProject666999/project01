package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"used_car_inspection/config"
)

func main() {
	config.LoadConfig()

	config.ConnectDB()

	app := fiber.New(fiber.Config{
		AppName: "二手车检测报告系统",
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	app.Static("/uploads", config.AppConfig.UploadDir)

	if err := os.MkdirAll(config.AppConfig.UploadDir, 0755); err != nil {
		log.Printf("创建上传目录失败: %v", err)
	}

	setupRoutes(app)

	log.Printf("服务器启动在端口 %s", config.AppConfig.Port)
	log.Fatal(app.Listen(":" + config.AppConfig.Port))
}

func setupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "服务运行正常",
		})
	})
}
