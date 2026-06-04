package routes

import (
	"museum-collection/controllers"
	"museum-collection/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
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
		api.POST("/auth/login", controllers.Login)
		
		auth := api.Group("")
		auth.Use(middleware.JWTAuth())
		{
			auth.GET("/auth/me", controllers.GetCurrentUser)
			auth.POST("/auth/change-password", controllers.ChangePassword)
			
			auth.GET("/statistics", controllers.GetStatistics)
			
			collections := auth.Group("/collections")
			{
				collections.GET("", controllers.GetCollections)
				collections.GET("/:id", controllers.GetCollection)
				collections.POST("", controllers.CreateCollection)
				collections.PUT("/:id", controllers.UpdateCollection)
				collections.DELETE("/:id", controllers.DeleteCollection)
				collections.GET("/qr/:qr_code", controllers.GetCollectionByQR)
			}
			
			photos := auth.Group("/photos")
			{
				photos.POST("", controllers.UploadPhoto)
				photos.DELETE("/:id", controllers.DeletePhoto)
			}
			
			models3d := auth.Group("/3d-models")
			{
				models3d.POST("", controllers.Upload3DModel)
				models3d.DELETE("/:id", controllers.Delete3DModel)
			}
			
			movements := auth.Group("/movements")
			{
				movements.GET("", controllers.GetMovements)
				movements.GET("/:id", controllers.GetMovement)
				movements.POST("", controllers.CreateMovement)
				movements.POST("/:id/approve", controllers.ApproveMovement)
				movements.POST("/:id/out-handover", controllers.OutHandover)
				movements.POST("/:id/in-handover", controllers.InHandover)
			}
			
			packing := auth.Group("/packing-lists")
			{
				packing.POST("", controllers.CreatePackingList)
				packing.GET("/:id", controllers.GetPackingList)
			}
			
			inventory := auth.Group("/inventory")
			{
				inventory.GET("/plans", controllers.GetInventoryPlans)
				inventory.GET("/plans/:id", controllers.GetInventoryPlan)
				inventory.POST("/plans", controllers.CreateInventoryPlan)
				inventory.POST("/plans/:id/start", controllers.StartInventory)
				inventory.POST("/plans/:id/complete", controllers.CompleteInventory)
				inventory.GET("/items", controllers.GetInventoryItems)
				inventory.POST("/check", controllers.CheckInventoryItem)
				inventory.POST("/batch-check", controllers.BatchCheckInventory)
			}
			
			status := auth.Group("/status-records")
			{
				status.GET("", controllers.GetStatusRecords)
				status.GET("/:id", controllers.GetStatusRecord)
				status.POST("", controllers.CreateStatusRecord)
			}
			
			auth.GET("/categories", controllers.GetCategories)
			auth.POST("/categories", controllers.CreateCategory)
			
			auth.GET("/locations", controllers.GetLocations)
			auth.POST("/locations", controllers.CreateLocation)
		}
		
		api.GET("/files/*filepath", controllers.GetFile)
	}
	
	return r
}
