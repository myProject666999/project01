package router

import (
	"coffee-baking/server/handler"
	"coffee-baking/server/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(r *gin.Engine, db *gorm.DB) {
	r.Use(middleware.CORS())

	gbHandler := &handler.GreenBeanHandler{DB: db}
	rrHandler := &handler.RoastingRecordHandler{DB: db}
	csHandler := &handler.CuppingScoreHandler{DB: db}

	api := r.Group("/api")
	{
		beans := api.Group("/green-beans")
		{
			beans.GET("", gbHandler.List)
			beans.GET("/:id", gbHandler.Get)
			beans.POST("", gbHandler.Create)
			beans.PUT("/:id", gbHandler.Update)
			beans.DELETE("/:id", gbHandler.Delete)
		}

		records := api.Group("/roasting-records")
		{
			records.GET("", rrHandler.List)
			records.GET("/:id", rrHandler.Get)
			records.POST("", rrHandler.Create)
			records.PUT("/:id", rrHandler.Update)
			records.DELETE("/:id", rrHandler.Delete)
			records.GET("/compare", rrHandler.Compare)
			records.POST("/import-artisan", rrHandler.ImportArtisan)
		}

		scores := api.Group("/cupping-scores")
		{
			scores.GET("", csHandler.List)
			scores.GET("/:id", csHandler.Get)
			scores.POST("", csHandler.Create)
			scores.PUT("/:id", csHandler.Update)
			scores.DELETE("/:id", csHandler.Delete)
		}
	}
}
