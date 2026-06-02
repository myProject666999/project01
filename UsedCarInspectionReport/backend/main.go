package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"used_car_inspection/config"
	"used_car_inspection/controllers"
	"used_car_inspection/middleware"
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

	api.Post("/auth/login", controllers.Login)
	api.Get("/share/:token", controllers.GetReportByShareToken)

	auth := api.Group("", middleware.JWTAuth)

	auth.Get("/auth/me", controllers.GetCurrentUser)
	auth.Put("/auth/password", controllers.ChangePassword)

	auth.Get("/vehicles", controllers.GetVehicles)
	auth.Get("/vehicles/:id", controllers.GetVehicle)
	auth.Post("/vehicles", controllers.CreateVehicle)
	auth.Put("/vehicles/:id", controllers.UpdateVehicle)
	auth.Delete("/vehicles/:id", controllers.DeleteVehicle)

	auth.Get("/inspection/categories", controllers.GetCategories)
	auth.Get("/inspection/items", controllers.GetItems)
	auth.Get("/inspection/items-with-categories", controllers.GetItemsWithCategories)

	auth.Get("/reports", controllers.GetReports)
	auth.Get("/reports/:id", controllers.GetReport)
	auth.Post("/reports", controllers.CreateReport)
	auth.Post("/reports/:id/results", controllers.SaveInspectionResult)
	auth.Post("/reports/:id/submit", controllers.SubmitReport)
	auth.Post("/reports/:id/share", controllers.GenerateShareLink)
	auth.Delete("/reports/:id", controllers.DeleteReport)

	auth.Post("/upload/photo", controllers.UploadPhoto)
	auth.Delete("/upload/photo/:id", controllers.DeletePhoto)
}
