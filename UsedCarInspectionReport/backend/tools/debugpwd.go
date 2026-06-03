package main

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type User struct {
	ID       uint64 `gorm:"column:id"`
	Username string `gorm:"column:username"`
	Password string `gorm:"column:password"`
	Status   int    `gorm:"column:status"`
}

func main() {
	dsn := "root:123456@tcp(127.0.0.1:3306)/used_car_inspection?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	var users []User
	db.Raw("SELECT id, username, password, status FROM users WHERE username = 'admin'").Scan(&users)

	for _, u := range users {
		fmt.Printf("用户: %s, 状态: %d, 密码哈希: %s\n", u.Username, u.Status, u.Password)
		fmt.Printf("密码哈希长度: %d\n", len(u.Password))

		err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte("123456"))
		if err == nil {
			fmt.Println("bcrypt验证: 密码匹配!")
		} else {
			fmt.Println("bcrypt验证失败:", err)
		}
	}

	newHash, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	result := db.Exec("UPDATE users SET password = ? WHERE username = 'admin'", string(newHash))
	fmt.Printf("重新设置admin密码, 影响: %d行\n", result.RowsAffected)

	db.Raw("SELECT id, username, password, status FROM users WHERE username = 'admin'").Scan(&users)
	for _, u := range users {
		fmt.Printf("更新后密码哈希: %s\n", u.Password)
		err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte("123456"))
		if err == nil {
			fmt.Println("更新后bcrypt验证: 密码匹配!")
		} else {
			fmt.Println("更新后bcrypt验证失败:", err)
		}
	}
}
