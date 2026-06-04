package main

import (
	"fmt"
	"museum-collection/config"
	"museum-collection/database"
	"museum-collection/routes"
	"os"
)

func main() {
	cfg := config.LoadConfig()
	
	if err := database.InitDB(cfg); err != nil {
		fmt.Printf("数据库连接失败: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("数据库连接成功")
	
	os.MkdirAll(cfg.UploadPath+"/photos", 0755)
	os.MkdirAll(cfg.UploadPath+"/3dmodels", 0755)
	
	r := routes.SetupRouter()
	
	fmt.Printf("服务器启动在端口 %s\n", cfg.ServerPort)
	r.Run(":" + cfg.ServerPort)
}
