package main

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := "root:123456@tcp(127.0.0.1:3306)/used_car_inspection?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	password := "123456"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("生成哈希失败:", err)
	}

	result := db.Exec("UPDATE users SET password = ? WHERE username IN ('admin','inspector01','inspector02')", string(hash))
	if result.Error != nil {
		log.Fatal("更新失败:", result.Error)
	}

	fmt.Printf("成功更新 %d 条用户密码\n", result.RowsAffected)

	var count int64
	db.Raw("SELECT COUNT(*) FROM users WHERE username IN ('admin','inspector01','inspector02')").Scan(&count)
	fmt.Printf("验证: 受影响用户数 = %d\n", count)
}
