package model

type DeclarationItem struct {
	BaseModel
	DeclarationID     uint        `json:"declaration_id" gorm:"not null;index"`
	Declaration       Declaration `json:"-" gorm:"foreignKey:DeclarationID"`
	ProductName       string      `json:"product_name" gorm:"type:varchar(200);not null"`
	HSCode            string      `json:"hs_code" gorm:"type:varchar(20);not null"`
	Quantity          int         `json:"quantity" gorm:"not null"`
	UnitPrice         float64     `json:"unit_price" gorm:"type:decimal(12,2);not null"`
	OriginCountry     string      `json:"origin_country" gorm:"type:varchar(50)"`
	DeclarationAmount float64     `json:"declaration_amount" gorm:"type:decimal(12,2);not null"`
	TaxNo             string      `json:"tax_no" gorm:"type:varchar(50)"`
}
