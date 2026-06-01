package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math/big"
	"time"
)

var languageLabels = map[string]map[string]string{
	"en": {
		"tracking_number": "Tracking Number",
		"recipient":       "Recipient",
		"address":         "Address",
		"phone":           "Phone",
		"weight":          "Weight",
		"warehouse":       "Warehouse",
		"delivered_by":    "Delivered By",
		"fragile":         "Fragile",
		"scan_to_track":   "Scan to Track",
	},
	"es": {
		"tracking_number": "Número de Seguimiento",
		"recipient":       "Destinatario",
		"address":         "Dirección",
		"phone":           "Teléfono",
		"weight":          "Peso",
		"warehouse":       "Almacén",
		"delivered_by":    "Entregado Por",
		"fragile":         "Frágil",
		"scan_to_track":   "Escanear para Rastrear",
	},
	"ar": {
		"tracking_number": "رقم التتبع",
		"recipient":       "المستلم",
		"address":         "العنوان",
		"phone":           "الهاتف",
		"weight":          "الوزن",
		"warehouse":       "المستودع",
		"delivered_by":    "تم التوصيل بواسطة",
		"fragile":         "قابل للكسر",
		"scan_to_track":   "امسح للتتبع",
	},
	"fr": {
		"tracking_number": "Numéro de Suivi",
		"recipient":       "Destinataire",
		"address":         "Adresse",
		"phone":           "Téléphone",
		"weight":          "Poids",
		"warehouse":       "Entrepôt",
		"delivered_by":    "Livré Par",
		"fragile":         "Fragile",
		"scan_to_track":   "Scanner pour Suivre",
	},
	"de": {
		"tracking_number": "Sendungsnummer",
		"recipient":       "Empfänger",
		"address":         "Adresse",
		"phone":           "Telefon",
		"weight":          "Gewicht",
		"warehouse":       "Lager",
		"delivered_by":    "Zugestellt Von",
		"fragile":         "Zerbrechlich",
		"scan_to_track":   "Scannen zum Verfolgen",
	},
}

func GetLabel(key, lang string) string {
	if labels, ok := languageLabels[lang]; ok {
		if value, ok := labels[key]; ok {
			return value
		}
	}
	if labels, ok := languageLabels["en"]; ok {
		if value, ok := labels[key]; ok {
			return value
		}
	}
	return key
}

func GenerateBatchNo() string {
	return fmt.Sprintf("B%s%s", time.Now().Format("20060102"), GenerateRandomString(6))
}

func GeneratePackageNo() string {
	return fmt.Sprintf("P%s%s", time.Now().Format("20060102"), GenerateRandomString(8))
}

func GenerateTaskNo() string {
	return fmt.Sprintf("T%s%s", time.Now().Format("20060102"), GenerateRandomString(8))
}

func GenerateRouteNo() string {
	return fmt.Sprintf("R%s%s", time.Now().Format("20060102"), GenerateRandomString(6))
}

func GenerateLabelNo() string {
	return fmt.Sprintf("LBL%s%s", time.Now().Format("20060102150405"), GenerateRandomString(4))
}

func GenerateCustomerNo() string {
	return fmt.Sprintf("CUST%s%s", time.Now().Format("20060102"), GenerateRandomString(6))
}

func GenerateRandomString(length int) string {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())[:length]
	}
	return hex.EncodeToString(bytes)[:length]
}

func GenerateRandomInt(max int) int {
	n, _ := rand.Int(rand.Reader, big.NewInt(int64(max)))
	return int(n.Int64())
}
