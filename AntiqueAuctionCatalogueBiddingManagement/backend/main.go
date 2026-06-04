package main

import (
	"antique-auction/config"
	"antique-auction/handlers"
	"antique-auction/middleware"
	"antique-auction/models"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.LoadConfig("config/config.yaml"); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := models.InitDB(); err != nil {
		log.Fatalf("Failed to init database: %v", err)
	}
	defer models.CloseDB()

	gin.SetMode(config.AppConfig.Server.Mode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
	}))

	setupRoutes(r)

	log.Printf("Server starting on port %s", config.AppConfig.Server.Port)
	if err := r.Run(":" + config.AppConfig.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/auth/login", handlers.Login)

		auth := api.Group("")
		auth.Use(middleware.JWTAuth())
		{
			auth.GET("/auth/me", handlers.GetCurrentUser)

			auctions := auth.Group("/auctions")
			{
				auctions.POST("", handlers.CreateAuction)
				auctions.GET("", handlers.GetAuctionList)
				auctions.GET("/:id", handlers.GetAuction)
				auctions.PUT("/:id", handlers.UpdateAuction)
				auctions.DELETE("/:id", handlers.DeleteAuction)
			}

			lots := auth.Group("/lots")
			{
				lots.POST("", handlers.CreateLot)
				lots.GET("", handlers.GetLotList)
				lots.GET("/:id", handlers.GetLot)
				lots.PUT("/:id", handlers.UpdateLot)
				lots.PUT("/sort-order", handlers.UpdateLotSortOrder)
				lots.DELETE("/:id", handlers.DeleteLot)
				lots.POST("/:id/images", handlers.AddLotImage)
				lots.DELETE("/:id/images/:image_id", handlers.DeleteLotImage)
			}

			bidders := auth.Group("/bidders")
			{
				bidders.POST("", handlers.CreateBidder)
				bidders.GET("", handlers.GetBidderList)
				bidders.GET("/:id", handlers.GetBidder)
				bidders.PUT("/:id", handlers.UpdateBidder)
				bidders.DELETE("/:id", handlers.DeleteBidder)
			}

			qualifications := auth.Group("/qualifications")
			{
				qualifications.POST("", handlers.CreateQualification)
				qualifications.GET("", handlers.GetQualificationList)
				qualifications.PUT("/:id", handlers.UpdateQualification)
				qualifications.POST("/:id/review", handlers.ReviewQualification)
				qualifications.DELETE("/:id", handlers.DeleteQualification)
			}

			appointments := auth.Group("/appointments")
			{
				appointments.POST("", handlers.CreateAppointment)
				appointments.GET("", handlers.GetAppointmentList)
				appointments.POST("/:id/checkin", handlers.CheckInAppointment)
				appointments.DELETE("/:id", handlers.DeleteAppointment)
			}

			results := auth.Group("/results")
			{
				results.POST("", handlers.CreateAuctionResult)
				results.GET("", handlers.GetAuctionResultList)
				results.PUT("/:id", handlers.UpdateAuctionResult)
				results.DELETE("/:id", handlers.DeleteAuctionResult)
			}

			auth.GET("/pdf/catalogue", handlers.ExportCatalogue)
		}
	}
}
