package main

import (
	"log"
	"logistics-final-delivery/internal/config"
	"logistics-final-delivery/internal/handler"
	"logistics-final-delivery/internal/repository"
	"logistics-final-delivery/internal/service"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	cfg := config.Load()

	if err := config.InitDB(&cfg.Database); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	db := config.GetDB()

	repo := repository.NewRepository(db)

	batchService := service.NewBatchService(repo)
	labelService := service.NewLabelService(repo)
	deliveryService := service.NewDeliveryService(repo)

	h := handler.NewHandler(batchService, labelService, deliveryService, &cfg.Upload)

	app := fiber.New(fiber.Config{
		BodyLimit: 50 * 1024 * 1024,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type,Authorization",
	}))

	app.Use(logger.New())

	api := app.Group("/api/v1")

	api.Static("/uploads", "../uploads")

	warehouse := api.Group("/warehouses")
	warehouse.Get("/", h.ListWarehouses)

	batch := api.Group("/batches")
	batch.Post("/", h.CreateBatch)
	batch.Get("/:id", h.GetBatch)
	batch.Get("/", h.ListBatches)
	batch.Post("/:id/packages", h.AddPackage)
	batch.Get("/:id/packages", h.ListPackagesByBatch)

	pkg := api.Group("/packages")
	pkg.Get("/", h.ListPackages)
	pkg.Get("/:id", h.GetPackage)
	pkg.Get("/:package_id/task", h.GetTaskByPackage)

	label := api.Group("/labels")
	label.Get("/", h.ListLabels)
	label.Get("/:package_id", h.GenerateLabel)
	label.Get("/:package_id/image", h.GetLabelImage)
	label.Get("/barcode/:package_id", h.GetBarcodeImage)
	label.Get("/qrcode/:package_no", h.GetQRCodeImage)

	courier := api.Group("/couriers")
	courier.Get("/", h.ListCouriers)
	courier.Get("/:id", h.GetCourier)
	courier.Get("/:courier_id/tasks", h.ListCourierTasks)

	route := api.Group("/routes")
	route.Post("/", h.CreateRoute)
	route.Get("/:id", h.GetRoute)
	route.Get("/", h.ListRoutes)
	route.Post("/:id/start", h.StartRoute)
	route.Post("/:id/complete", h.CompleteRoute)

	task := api.Group("/tasks")
	task.Get("/", h.ListTasks)
	task.Get("/pending", h.ListPendingTasks)
	task.Get("/:id", h.GetTask)
	task.Get("/:id/proof", h.GetTaskProof)
	task.Post("/:id/accept", h.AcceptTask)
	task.Post("/:id/start", h.StartDelivery)
	task.Post("/:id/complete", h.CompleteDeliveryByTask)
	task.Post("/:id/exception", h.ReportExceptionByTask)
	task.Post("/complete", h.CompleteDelivery)
	task.Post("/exception", h.ReportException)

	exception := api.Group("/exceptions")
	exception.Get("/:id", h.GetException)
	exception.Get("/", h.ListExceptions)
	exception.Post("/handle", h.HandleException)

	upload := api.Group("/upload")
	upload.Post("/photo", h.UploadPhoto)
	upload.Post("/signature", h.UploadSignature)

	log.Printf("Server starting on port %s", cfg.Server.Port)
	if err := app.Listen(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
