package service

import (
	"customs-declaration/model"
	"customs-declaration/repository"
	"fmt"
	"math/rand"
	"time"
)

type OrderService struct {
	OrderRepo *repository.OrderRepo
}

func NewOrderService(repo *repository.OrderRepo) *OrderService {
	return &OrderService{OrderRepo: repo}
}

func (s *OrderService) ListOrders(page, pageSize int, platform, status, startDate, endDate string) ([]model.Order, int64, error) {
	orders, total := s.OrderRepo.FindAll(page, pageSize, platform, status, startDate, endDate)
	return orders, total, nil
}

func (s *OrderService) GetOrder(id uint) (*model.Order, error) {
	return s.OrderRepo.FindByID(id)
}

func (s *OrderService) SyncOrders(platform string) error {
	customerNames := []string{"张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"}
	type productInfo struct {
		Name     string
		SKU      string
		Category string
	}
	products := []productInfo{
		{"蓝牙耳机", "SKU001", "电子产品"},
		{"棉制T恤衫", "SKU002", "服装"},
		{"皮革制鞋靴", "SKU003", "鞋类"},
		{"毛绒玩具", "SKU004", "玩具"},
		{"塑料箱包", "SKU005", "箱包"},
		{"不锈钢餐具", "SKU006", "家居用品"},
		{"笔记本电脑", "SKU007", "电子产品"},
		{"智能手表", "SKU008", "电子产品"},
		{"棉制男衬衫", "SKU009", "服装"},
		{"香水", "SKU010", "化妆品"},
		{"木制家具", "SKU011", "家具"},
		{"护肤品", "SKU012", "化妆品"},
	}
	countries := []string{"中国", "日本", "韩国", "美国", "德国"}

	orderCount := rand.Intn(3) + 3

	now := time.Now()
	for i := 0; i < orderCount; i++ {
		orderDate := now.Add(-time.Duration(rand.Intn(72)) * time.Hour)

		itemCount := rand.Intn(3) + 1
		var items []model.OrderItem
		var totalAmount float64

		for j := 0; j < itemCount; j++ {
			unitPrice := float64(rand.Intn(9000)+1000) / 100.0
			quantity := rand.Intn(5) + 1
			totalAmount += unitPrice * float64(quantity)

			p := products[rand.Intn(len(products))]
			items = append(items, model.OrderItem{
				ProductName:   p.Name,
				SKU:           p.SKU,
				Category:      p.Category,
				Quantity:      quantity,
				UnitPrice:     unitPrice,
				OriginCountry: countries[rand.Intn(len(countries))],
				HSMatched:     false,
			})
		}

		order := model.Order{
			PlatformOrderID: fmt.Sprintf("%s-%d-%d", platform, now.Unix(), i),
			Platform:        platform,
			OrderDate:       &orderDate,
			CustomerName:    customerNames[rand.Intn(len(customerNames))],
			TotalAmount:     totalAmount,
			Currency:        "USD",
			Status:          "pending",
			OrderItems:      items,
		}

		if err := s.OrderRepo.Create(&order); err != nil {
			return err
		}
	}

	return nil
}

func (s *OrderService) UpdateOrderStatus(id uint, status string) error {
	order, err := s.OrderRepo.FindByID(id)
	if err != nil {
		return err
	}
	order.Status = status
	return s.OrderRepo.Update(order)
}
