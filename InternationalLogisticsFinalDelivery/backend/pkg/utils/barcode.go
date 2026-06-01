package utils

import (
	"bytes"
	"image/png"
	"os"
	"path/filepath"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/code128"
	"github.com/boombuler/barcode/qr"
)

func GenerateCode128(content string, width, height int) ([]byte, error) {
	code, err := code128.Encode(content)
	if err != nil {
		return nil, err
	}

	scaledCode, err := barcode.Scale(code, width, height)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	err = png.Encode(&buf, scaledCode)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func GenerateQRCode(content string, size int) ([]byte, error) {
	qrCode, err := qr.Encode(content, qr.M, qr.Auto)
	if err != nil {
		return nil, err
	}

	scaledCode, err := barcode.Scale(qrCode, size, size)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	err = png.Encode(&buf, scaledCode)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func SaveBarcodeToFile(content, filePath string, width, height int) error {
	barcodeBytes, err := GenerateCode128(content, width, height)
	if err != nil {
		return err
	}

	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	return os.WriteFile(filePath, barcodeBytes, 0644)
}

func SaveQRCodeToFile(content, filePath string, size int) error {
	qrBytes, err := GenerateQRCode(content, size)
	if err != nil {
		return err
	}

	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	return os.WriteFile(filePath, qrBytes, 0644)
}
