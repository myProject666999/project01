package main

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := "root:123456@tcp(127.0.0.1:3306)/used_car_inspection?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	fmt.Println("=== 清理数据库中旧的 share_token 空字符串 ===")
	result := db.Exec("UPDATE inspection_reports SET share_token = NULL WHERE share_token = ''")
	fmt.Printf("更新了 %d 条记录\n", result.RowsAffected)

	fmt.Println("\n=== 当前报告记录 ===")
	var count int64
	db.Raw("SELECT COUNT(*) FROM inspection_reports").Scan(&count)
	fmt.Printf("总报告数: %d\n", count)

	var reports []struct {
		ID         uint64
		ReportNo   string
		ShareToken *string
	}
	db.Raw("SELECT id, report_no, share_token FROM inspection_reports").Scan(&reports)
	for _, r := range reports {
		token := "NULL"
		if r.ShareToken != nil {
			token = *r.ShareToken
		}
		fmt.Printf("  ID:%d, No:%s, share_token:%s\n", r.ID, r.ReportNo, token)
	}

	fmt.Println("\n=== 清理完成 ✅ ===")
}
