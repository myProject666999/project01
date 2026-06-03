package model

type OrderItem struct {
	BaseModel
	OrderID       uint   `json:"order_id" gorm:"not null;index"`
	Order         Order  `json:"-" gorm:"foreignKey:OrderID"`
	ProductName   string `json:"product_name" gorm:"type:varchar(200);not null"`
	SKU           string `json:"sku" gorm:"type:varchar(100);not null"`
	Category      string `json:"category" gorm:"type:varchar(100);not null"`
	Quantity      int    `json:"quantity" gorm:"not null"`
	UnitPrice     float64 `json:"unit_price" gorm:"type:decimal(12,2);not null"`
	HSCode        string `json:"hs_code" gorm:"type:varchar(20)"`
	OriginCountry string `json:"origin_country" gorm:"type:varchar(50)"`
	HSMatched     bool   `json:"hs_matched" gorm:"type:tinyint;not null;default:0"`
}
