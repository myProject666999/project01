package routes

import (
	"database/sql"
	"net/http"

	"tcm-traceability/config"
	"tcm-traceability/handlers"
	"tcm-traceability/middleware"
	"tcm-traceability/pkg/response"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func SetupRoutes(e *echo.Echo, db *sql.DB) {
	e.Use(middleware.CORS())
	e.Use(middleware.AccessLog(db))

	e.GET("/health", func(c echo.Context) error {
		return response.Success(c, map[string]string{
			"status":  "ok",
			"version": "1.0.0",
		})
	})

	api := e.Group("/api")

	operatorHandler := handlers.NewOperatorHandler()
	pesticideHandler := handlers.NewPesticideHandler()
	fertilizerHandler := handlers.NewFertilizerHandler()
	herbVarietyHandler := handlers.NewHerbVarietyHandler()
	farmingOpTypeHandler := handlers.NewFarmingOperationTypeHandler()
	processingStepTypeHandler := handlers.NewProcessingStepTypeHandler()

	plotHandler := handlers.NewPlotHandler()
	farmingRecordHandler := handlers.NewFarmingRecordHandler()
	harvestBatchHandler := handlers.NewHarvestBatchHandler()
	processingRecordHandler := handlers.NewProcessingRecordHandler()

	productHandler := handlers.NewProductHandler()
	qrCodeHandler := handlers.NewQRCodeHandler()
	outboundHandler := handlers.NewOutboundHandler()

	api.GET("/operators", operatorHandler.GetList)
	api.GET("/operators/:id", operatorHandler.GetByID)
	api.POST("/operators", operatorHandler.Create)
	api.PUT("/operators/:id", operatorHandler.Update)
	api.DELETE("/operators/:id", operatorHandler.Delete)

	api.GET("/pesticides", pesticideHandler.GetList)
	api.GET("/pesticides/:id", pesticideHandler.GetByID)
	api.POST("/pesticides", pesticideHandler.Create)
	api.PUT("/pesticides/:id", pesticideHandler.Update)
	api.DELETE("/pesticides/:id", pesticideHandler.Delete)

	api.GET("/fertilizers", fertilizerHandler.GetList)
	api.GET("/fertilizers/:id", fertilizerHandler.GetByID)
	api.POST("/fertilizers", fertilizerHandler.Create)
	api.PUT("/fertilizers/:id", fertilizerHandler.Update)
	api.DELETE("/fertilizers/:id", fertilizerHandler.Delete)

	api.GET("/herb-varieties", herbVarietyHandler.GetList)
	api.GET("/herb-varieties/:id", herbVarietyHandler.GetByID)
	api.POST("/herb-varieties", herbVarietyHandler.Create)
	api.PUT("/herb-varieties/:id", herbVarietyHandler.Update)
	api.DELETE("/herb-varieties/:id", herbVarietyHandler.Delete)

	api.GET("/farming-operation-types", farmingOpTypeHandler.GetList)
	api.GET("/farming-operation-types/:id", farmingOpTypeHandler.GetByID)
	api.POST("/farming-operation-types", farmingOpTypeHandler.Create)
	api.PUT("/farming-operation-types/:id", farmingOpTypeHandler.Update)
	api.DELETE("/farming-operation-types/:id", farmingOpTypeHandler.Delete)

	api.GET("/processing-step-types", processingStepTypeHandler.GetList)
	api.GET("/processing-step-types/:id", processingStepTypeHandler.GetByID)
	api.POST("/processing-step-types", processingStepTypeHandler.Create)
	api.PUT("/processing-step-types/:id", processingStepTypeHandler.Update)
	api.DELETE("/processing-step-types/:id", processingStepTypeHandler.Delete)

	api.GET("/plots", plotHandler.GetList)
	api.GET("/plots/:id", plotHandler.GetByID)
	api.POST("/plots", plotHandler.Create)
	api.PUT("/plots/:id", plotHandler.Update)
	api.DELETE("/plots/:id", plotHandler.Delete)

	api.GET("/farming-records", farmingRecordHandler.GetList)
	api.GET("/farming-records/:id", farmingRecordHandler.GetByID)
	api.POST("/farming-records", farmingRecordHandler.Create)
	api.PUT("/farming-records/:id", farmingRecordHandler.Update)
	api.DELETE("/farming-records/:id", farmingRecordHandler.Delete)

	api.GET("/harvest-batches", harvestBatchHandler.GetList)
	api.GET("/harvest-batches/:id", harvestBatchHandler.GetByID)
	api.POST("/harvest-batches", harvestBatchHandler.Create)
	api.PUT("/harvest-batches/:id", harvestBatchHandler.Update)
	api.DELETE("/harvest-batches/:id", harvestBatchHandler.Delete)

	api.GET("/processing-records", processingRecordHandler.GetList)
	api.GET("/processing-records/:id", processingRecordHandler.GetByID)
	api.POST("/processing-records", processingRecordHandler.Create)
	api.PUT("/processing-records/:id", processingRecordHandler.Update)
	api.DELETE("/processing-records/:id", processingRecordHandler.Delete)

	api.GET("/products", productHandler.GetList)
	api.GET("/products/:id", productHandler.GetByID)
	api.POST("/products", productHandler.Create)
	api.PUT("/products/:id", productHandler.Update)
	api.DELETE("/products/:id", productHandler.Delete)

	api.GET("/qrcodes", qrCodeHandler.GetList)
	api.GET("/qrcodes/:id", qrCodeHandler.GetByID)
	api.GET("/qrcodes/:id/image", qrCodeHandler.GetQRCodeImage)
	api.POST("/qrcodes", qrCodeHandler.Create)
	api.POST("/qrcodes/generate", qrCodeHandler.GenerateForProduct)

	api.GET("/outbounds", outboundHandler.GetList)
	api.GET("/outbounds/:id", outboundHandler.GetByID)
	api.GET("/outbounds/safety-check/:product_id", outboundHandler.GetSafetyCheck)
	api.POST("/outbounds", outboundHandler.Create)

	scanHandler := handlers.NewScanHandler()
	scanGroup := e.Group("/scan")
	scanGroup.Use(middleware.RateLimitWithConfig(
		config.AppConfig.RateLimitPerMinute,
		config.AppConfig.RateLimitPerHour,
	))
	scanGroup.Use(middleware.AntiCrawl(db))
	scanGroup.GET("/:qr_code", scanHandler.GetTraceability)

	e.Use(echoMiddleware.StaticWithConfig(echoMiddleware.StaticConfig{
		Root:   "../frontend/dist",
		HTML5:  true,
		Browse: false,
	}))

	e.HTTPErrorHandler = customHTTPErrorHandler
}

func customHTTPErrorHandler(err error, c echo.Context) {
	code := http.StatusInternalServerError
	message := "Internal Server Error"

	if he, ok := err.(*echo.HTTPError); ok {
		code = he.Code
		if msg, ok := he.Message.(string); ok {
			message = msg
		}
	}

	if !c.Response().Committed {
		_ = c.JSON(code, response.Response{
			Code:    code,
			Message: message,
		})
	}
}
