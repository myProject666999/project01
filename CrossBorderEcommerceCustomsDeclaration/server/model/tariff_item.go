package model

type TariffItem struct {
	ID             uint         `json:"id" gorm:"primaryKey;autoIncrement"`
	TariffRecordID uint         `json:"tariff_record_id" gorm:"not null;index"`
	TariffRecord   TariffRecord `json:"-" gorm:"foreignKey:TariffRecordID"`
	HSCode         string       `json:"hs_code" gorm:"type:varchar(20);not null"`
	TaxType        string       `json:"tax_type" gorm:"type:varchar(30);not null"`
	TaxRate        float64      `json:"tax_rate" gorm:"type:decimal(5,2);not null"`
	TaxableAmount  float64      `json:"taxable_amount" gorm:"type:decimal(12,2);not null"`
	TaxAmount      float64      `json:"tax_amount" gorm:"type:decimal(12,2);not null"`
}
