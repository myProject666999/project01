package router

import (
	"github.com/labstack/echo/v4"
	"ocpp-charging/handler"
	"ocpp-charging/middleware"
	"ocpp-charging/ws"
)

func SetupRoutes(e *echo.Echo) {
	e.Use(middleware.CORSMiddleware())

	userHandler := handler.NewUserHandler()
	stationHandler := handler.NewStationHandler()
	chargeHandler := handler.NewChargeHandler()
	dashboardHandler := handler.NewDashboardHandler()
	paymentHandler := handler.NewPaymentHandler()

	e.GET("/ocpp", func(c echo.Context) error {
		ws.HandleOCPPWebSocket(c.Response(), c.Request())
		return nil
	})

	api := e.Group("/api")

	auth := api.Group("/auth")
	auth.POST("/register", userHandler.Register)
	auth.POST("/login", userHandler.Login)

	user := api.Group("/user")
	user.Use(middleware.JWTMiddleware())
	user.GET("/profile", userHandler.GetProfile)

	stations := api.Group("/stations")
	stations.GET("", stationHandler.GetAllStations)
	stations.GET("/:station_id/charge-points", stationHandler.GetChargePoints)

	api.POST("/scan", stationHandler.ScanQR)

	charge := api.Group("/charge")
	charge.Use(middleware.JWTMiddleware())
	charge.POST("/reserve", chargeHandler.Reserve)
	charge.POST("/start", chargeHandler.StartCharge)
	charge.POST("/stop", chargeHandler.StopCharge)
	charge.GET("/transaction/:transaction_id", chargeHandler.GetTransaction)
	charge.GET("/transactions", chargeHandler.GetUserTransactions)

	payment := api.Group("/payment")
	payment.Use(middleware.JWTMiddleware())
	payment.POST("/pay", paymentHandler.Pay)
	payment.POST("/recharge", paymentHandler.Recharge)
	payment.GET("/balance", paymentHandler.GetBalance)

	dashboard := api.Group("/dashboard")
	dashboard.GET("/stats", dashboardHandler.GetStats)
	dashboard.GET("/charge-points", dashboardHandler.GetChargePoints)
}
