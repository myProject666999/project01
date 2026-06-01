package routes

import (
	"central-kitchen/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		customers := api.Group("/customers")
		{
			customers.GET("", handlers.GetCustomers)
			customers.GET("/:id", handlers.GetCustomer)
			customers.POST("", handlers.CreateCustomer)
			customers.PUT("/:id", handlers.UpdateCustomer)
			customers.DELETE("/:id", handlers.DeleteCustomer)
		}

		products := api.Group("/products")
		{
			products.GET("", handlers.GetProducts)
			products.GET("/:id", handlers.GetProduct)
			products.POST("", handlers.CreateProduct)
			products.PUT("/:id", handlers.UpdateProduct)
			products.DELETE("/:id", handlers.DeleteProduct)
		}

		equipment := api.Group("/equipment")
		{
			equipment.GET("", handlers.GetEquipment)
			equipment.POST("", handlers.CreateEquipment)
		}

		orders := api.Group("/orders")
		{
			orders.GET("", handlers.GetOrders)
			orders.GET("/:id", handlers.GetOrder)
			orders.POST("", handlers.CreateOrder)
			orders.PUT("/:id/status", handlers.UpdateOrderStatus)
		}

		processing := api.Group("/processing")
		{
			processing.GET("", handlers.GetProcessingTasks)
			processing.POST("/generate", handlers.GenerateProcessingTasks)
			processing.PUT("/:id/status", handlers.UpdateProcessingTaskStatus)
		}

		vehicles := api.Group("/vehicles")
		{
			vehicles.GET("", handlers.GetVehicles)
		}

		deliveries := api.Group("/deliveries")
		{
			deliveries.GET("", handlers.GetDeliveries)
			deliveries.GET("/:id", handlers.GetDelivery)
			deliveries.POST("/generate", handlers.GenerateDeliveries)
			deliveries.PUT("/:id/status", handlers.UpdateDeliveryStatus)
			deliveries.PUT("/items/:id/sign", handlers.SignDeliveryItem)
		}

		temperature := api.Group("/temperature")
		{
			temperature.GET("", handlers.GetTemperatureRecords)
			temperature.POST("", handlers.CreateTemperatureRecord)
		}

		waste := api.Group("/waste")
		{
			waste.GET("", handlers.GetWasteRecords)
			waste.POST("", handlers.CreateWasteRecord)
		}
	}

	return r
}
