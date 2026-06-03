package router

import (
	"customs-declaration/controller"
	"customs-declaration/repository"
	"customs-declaration/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	orderRepo := &repository.OrderRepo{DB: db}
	hsCodeRepo := &repository.HSCodeRepo{DB: db}
	declarationRepo := &repository.DeclarationRepo{DB: db}
	tariffRepo := &repository.TariffRepo{DB: db}
	archiveRepo := &repository.ArchiveRepo{DB: db}
	dashboardRepo := &repository.DashboardRepo{DB: db}

	orderService := service.NewOrderService(orderRepo)
	hsCodeService := service.NewHsCodeService(hsCodeRepo)
	declarationService := service.NewDeclarationService(declarationRepo, orderRepo, tariffRepo, archiveRepo)
	tariffService := service.NewTariffService(tariffRepo)
	archiveService := service.NewArchiveService(archiveRepo)
	dashboardService := service.NewDashboardService(dashboardRepo)

	dashboardCtrl := &controller.DashboardController{Service: dashboardService}
	orderCtrl := &controller.OrderController{Service: orderService}
	hsCodeCtrl := &controller.HsCodeController{Service: hsCodeService}
	declarationCtrl := &controller.DeclarationController{Service: declarationService}
	tariffCtrl := &controller.TariffController{Service: tariffService}
	archiveCtrl := &controller.ArchiveController{Service: archiveService}

	api := r.Group("/api")
	{
		dashboard := api.Group("/dashboard")
		{
			dashboard.GET("/stats", dashboardCtrl.GetStats)
			dashboard.GET("/pending-tasks", dashboardCtrl.GetPendingTasks)
			dashboard.GET("/trend", dashboardCtrl.GetTrend)
		}

		orders := api.Group("/orders")
		{
			orders.GET("", orderCtrl.ListOrders)
			orders.GET("/:id", orderCtrl.GetOrder)
			orders.POST("/sync", orderCtrl.SyncOrders)
		}

		hsCodes := api.Group("/hs-codes")
		{
			hsCodes.GET("", hsCodeCtrl.ListHsCodes)
			hsCodes.GET("/:code", hsCodeCtrl.GetHsCode)
			hsCodes.POST("", hsCodeCtrl.CreateHsCode)
			hsCodes.PUT("/:code", hsCodeCtrl.UpdateHsCode)
			hsCodes.GET("/mappings", hsCodeCtrl.ListMappings)
			hsCodes.POST("/mappings", hsCodeCtrl.CreateMapping)
			hsCodes.PUT("/mappings/:id", hsCodeCtrl.UpdateMapping)
			hsCodes.DELETE("/mappings/:id", hsCodeCtrl.DeleteMapping)
			hsCodes.POST("/auto-match", hsCodeCtrl.AutoMatch)
			hsCodes.GET("/unmatched", hsCodeCtrl.ListUnmatchedItems)
			hsCodes.POST("/manual-match", hsCodeCtrl.ManualMatch)
		}

		declarations := api.Group("/declarations")
		{
			declarations.GET("", declarationCtrl.ListDeclarations)
			declarations.GET("/:id", declarationCtrl.GetDeclaration)
			declarations.POST("", declarationCtrl.CreateDeclaration)
			declarations.POST("/:id/submit", declarationCtrl.SubmitDeclaration)
			declarations.POST("/:id/resubmit", declarationCtrl.ResubmitDeclaration)
			declarations.POST("/:id/reject", declarationCtrl.RejectDeclaration)
			declarations.PUT("/:id/items/:itemId", declarationCtrl.UpdateDeclarationItem)
		}

		tariffs := api.Group("/tariffs")
		{
			tariffs.GET("", tariffCtrl.ListTariffs)
			tariffs.GET("/statistics", tariffCtrl.GetStatistics)
			tariffs.GET("/:id", tariffCtrl.GetTariff)
			tariffs.PUT("/:id/pay", tariffCtrl.PayTariff)
		}

		archives := api.Group("/archives")
		{
			archives.GET("", archiveCtrl.ListArchives)
			archives.GET("/:id", archiveCtrl.GetArchive)
		}
	}
}
