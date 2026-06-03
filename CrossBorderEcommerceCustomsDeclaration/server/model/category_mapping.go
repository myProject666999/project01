package model

type CategoryMapping struct {
	BaseModel
	Category  string  `json:"category" gorm:"type:varchar(100);not null"`
	HSCode    string  `json:"hs_code" gorm:"type:varchar(20);not null;index"`
	HSCodeRef HSCode  `json:"-" gorm:"foreignKey:HSCode;references:Code"`
	Priority  int     `json:"priority" gorm:"not null;default:0"`
	AutoMatch bool    `json:"auto_match" gorm:"type:tinyint;not null;default:0"`
}
