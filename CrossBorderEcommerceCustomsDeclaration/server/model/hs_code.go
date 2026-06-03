package model

type HSCode struct {
	BaseModel
	Code             string             `json:"code" gorm:"type:varchar(20);not null;uniqueIndex"`
	Description      string             `json:"description" gorm:"type:varchar(500);not null"`
	Category         string             `json:"category" gorm:"type:varchar(100);not null"`
	TaxRate          float64            `json:"tax_rate" gorm:"type:decimal(5,2);not null"`
	Unit             string             `json:"unit" gorm:"type:varchar(20)"`
	Remark           string             `json:"remark" gorm:"type:varchar(500)"`
	CategoryMappings []CategoryMapping  `json:"category_mappings,omitempty" gorm:"foreignKey:HSCode;references:Code"`
}
