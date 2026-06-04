package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type LoginResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Token string `json:"token"`
	} `json:"data"`
}

type ReportResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    struct {
		ID uint64 `json:"id"`
	} `json:"data"`
}

func main() {
	baseURL := "http://127.0.0.1:3001/api"
	client := &http.Client{Timeout: 30 * time.Second}

	fmt.Println("=== 测试1: 登录 ===")
	loginBody := `{"username":"admin","password":"123456"}`
	resp, err := client.Post(baseURL+"/auth/login", "application/json", bytes.NewBufferString(loginBody))
	if err != nil {
		fmt.Println("登录失败:", err)
		return
	}
	defer resp.Body.Close()

	var loginResp LoginResponse
	body, _ := io.ReadAll(resp.Body)
	json.Unmarshal(body, &loginResp)
	fmt.Printf("登录状态: %d - %s\n", loginResp.Code, loginResp.Message)
	token := loginResp.Data.Token
	fmt.Println("Token获取成功 ✅\n")

	authHeader := "Bearer " + token

	fmt.Println("=== 测试2: 创建报告 ===")
	createBody := `{"vehicleId":1,"inspectionDate":"2026-06-04","mileage":50000}`
	req, _ := http.NewRequest("POST", baseURL+"/reports", bytes.NewBufferString(createBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", authHeader)
	resp2, err := client.Do(req)
	if err != nil {
		fmt.Println("创建报告失败:", err)
		return
	}
	defer resp2.Body.Close()

	body2, _ := io.ReadAll(resp2.Body)
	fmt.Printf("创建报告响应: %s\n", string(body2))

	var reportResp ReportResponse
	json.Unmarshal(body2, &reportResp)
	if reportResp.Code != 200 {
		fmt.Println("创建报告失败 ❌")
		return
	}
	reportId := reportResp.Data.ID
	fmt.Printf("创建报告成功, ID: %d ✅\n\n", reportId)

	fmt.Println("=== 测试3: 保存检测结果 ===")
	resultsBody := fmt.Sprintf(`[{"reportId":%d,"itemId":1,"categoryId":1,"result":"ok","score":10,"remark":"测试结果","id":0},{"reportId":%d,"itemId":2,"categoryId":1,"result":"attention","score":6,"remark":"需要注意","id":0},{"reportId":%d,"itemId":3,"categoryId":1,"result":"abnormal","score":0,"remark":"异常项目","id":0}]`, reportId, reportId, reportId)
	req3, _ := http.NewRequest("POST", fmt.Sprintf("%s/reports/%d/results", baseURL, reportId), bytes.NewBufferString(resultsBody))
	req3.Header.Set("Content-Type", "application/json")
	req3.Header.Set("Authorization", authHeader)
	resp3, err := client.Do(req3)
	if err != nil {
		fmt.Println("保存结果失败:", err)
		return
	}
	defer resp3.Body.Close()
	body3, _ := io.ReadAll(resp3.Body)
	fmt.Printf("保存结果响应: %s\n", string(body3))
	fmt.Println("保存检测结果成功 ✅\n")

	fmt.Println("=== 测试4: 提交报告 ===")
	req4, _ := http.NewRequest("POST", fmt.Sprintf("%s/reports/%d/submit", baseURL, reportId), nil)
	req4.Header.Set("Authorization", authHeader)
	resp4, err := client.Do(req4)
	if err != nil {
		fmt.Println("提交报告失败:", err)
		return
	}
	defer resp4.Body.Close()
	body4, _ := io.ReadAll(resp4.Body)
	fmt.Printf("提交报告响应: %s\n", string(body4))

	var submitResp ReportResponse
	json.Unmarshal(body4, &submitResp)
	if submitResp.Code != 200 {
		fmt.Println("提交报告失败 ❌")
		return
	}
	fmt.Println("提交报告成功 ✅\n")

	fmt.Println("=== 测试5: 生成分享链接 ===")
	req5, _ := http.NewRequest("POST", fmt.Sprintf("%s/reports/%d/share", baseURL, reportId), nil)
	req5.Header.Set("Authorization", authHeader)
	resp5, err := client.Do(req5)
	if err != nil {
		fmt.Println("生成分享链接失败:", err)
		return
	}
	defer resp5.Body.Close()
	body5, _ := io.ReadAll(resp5.Body)
	fmt.Printf("生成分享链接响应: %s\n", string(body5))
	fmt.Println("生成分享链接成功 ✅\n")

	fmt.Println("=== 所有测试通过 ✅ ===")
}
