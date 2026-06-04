package utils

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image/color"
	"image/png"
	"os"
	"path/filepath"

	"github.com/skip2/go-qrcode"
)

// QRCodeConfig 二维码配置
type QRCodeConfig struct {
	Level      qrcode.RecoveryLevel
	Size       int
	Margin     int
	Foreground color.RGBA
	Background color.RGBA
}

// DefaultQRCodeConfig 默认二维码配置
var DefaultQRCodeConfig = QRCodeConfig{
	Level:      qrcode.Medium,
	Size:       256,
	Margin:     2,
	Foreground: color.RGBA{R: 0, G: 0, B: 0, A: 255},
	Background: color.RGBA{R: 255, G: 255, B: 255, A: 255},
}

// GenerateQRCode 生成二维码图片字节数组
// content: 二维码内容
// 返回PNG格式的字节数组
func GenerateQRCode(content string) ([]byte, error) {
	return GenerateQRCodeWithConfig(content, DefaultQRCodeConfig)
}

// GenerateQRCodeWithConfig 使用自定义配置生成二维码
// content: 二维码内容
// config: 二维码配置
// 返回PNG格式的字节数组
func GenerateQRCodeWithConfig(content string, config QRCodeConfig) ([]byte, error) {
	if content == "" {
		return nil, fmt.Errorf("二维码内容不能为空")
	}

	q, err := qrcode.New(content, config.Level)
	if err != nil {
		return nil, fmt.Errorf("创建二维码失败: %w", err)
	}

	q.BackgroundColor = config.Background
	q.ForegroundColor = config.Foreground

	var buf bytes.Buffer
	err = q.Write(config.Size, &buf)
	if err != nil {
		return nil, fmt.Errorf("生成二维码失败: %w", err)
	}

	return buf.Bytes(), nil
}

// GenerateQRCodeToFile 生成二维码并保存到文件
// content: 二维码内容
// filePath: 保存文件路径
// 返回错误信息
func GenerateQRCodeToFile(content, filePath string) error {
	bytes, err := GenerateQRCode(content)
	if err != nil {
		return err
	}

	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("创建目录失败: %w", err)
	}

	if err := os.WriteFile(filePath, bytes, 0644); err != nil {
		return fmt.Errorf("保存二维码失败: %w", err)
	}

	return nil
}

// GenerateQRCodeToFileWithConfig 使用自定义配置生成二维码并保存到文件
func GenerateQRCodeToFileWithConfig(content, filePath string, config QRCodeConfig) error {
	bytes, err := GenerateQRCodeWithConfig(content, config)
	if err != nil {
		return err
	}

	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("创建目录失败: %w", err)
	}

	if err := os.WriteFile(filePath, bytes, 0644); err != nil {
		return fmt.Errorf("保存二维码失败: %w", err)
	}

	return nil
}

// GenerateQRCodeBase64 生成Base64编码的二维码图片
// content: 二维码内容
// 返回Base64编码字符串（包含data:image/png;base64,前缀）
func GenerateQRCodeBase64(content string) (string, error) {
	bytes, err := GenerateQRCode(content)
	if err != nil {
		return "", err
	}

	base64Str := base64.StdEncoding.EncodeToString(bytes)
	return fmt.Sprintf("data:image/png;base64,%s", base64Str), nil
}

// GenerateQRCodeBase64WithConfig 使用自定义配置生成Base64编码的二维码
func GenerateQRCodeBase64WithConfig(content string, config QRCodeConfig) (string, error) {
	bytes, err := GenerateQRCodeWithConfig(content, config)
	if err != nil {
		return "", err
	}

	base64Str := base64.StdEncoding.EncodeToString(bytes)
	return fmt.Sprintf("data:image/png;base64,%s", base64Str), nil
}

// GenerateTCMQRCode 生成中药材溯源专用二维码
// qrCode: 二维码唯一标识
// baseURL: 基础URL
// 返回PNG格式的字节数组
func GenerateTCMQRCode(qrCode, baseURL string) ([]byte, error) {
	if qrCode == "" {
		return nil, fmt.Errorf("二维码标识不能为空")
	}

	content := fmt.Sprintf("%s/%s", baseURL, qrCode)
	return GenerateQRCode(content)
}

// GenerateTCMQRCodeBase64 生成中药材溯源专用二维码（Base64格式）
func GenerateTCMQRCodeBase64(qrCode, baseURL string) (string, error) {
	if qrCode == "" {
		return "", fmt.Errorf("二维码标识不能为空")
	}

	content := fmt.Sprintf("%s/%s", baseURL, qrCode)
	return GenerateQRCodeBase64(content)
}

// DecodeQRCodeImage 解码二维码图片文件（辅助函数）
// 注意：go-qrcode库不支持解码，这里仅作为占位符
// 如果需要解码功能，需要引入其他库如github.com/makiuchi-d/gozxing
func DecodeQRCodeImage(filePath string) (string, error) {
	_, err := os.Stat(filePath)
	if err != nil {
		return "", fmt.Errorf("文件不存在: %w", err)
	}

	return "", fmt.Errorf("go-qrcode库不支持解码功能，请使用专用的二维码解码库")
}

// GenerateQRCodeImage 生成image.Image对象
// content: 二维码内容
// config: 二维码配置
// 返回image.Image对象
func GenerateQRCodeImage(content string, config QRCodeConfig) (*qrcode.QRCode, error) {
	if content == "" {
		return nil, fmt.Errorf("二维码内容不能为空")
	}

	q, err := qrcode.New(content, config.Level)
	if err != nil {
		return nil, fmt.Errorf("创建二维码失败: %w", err)
	}

	q.BackgroundColor = config.Background
	q.ForegroundColor = config.Foreground

	return q, nil
}

// QRCodeToPNGBytes 将QRCode对象转换为PNG字节数组
func QRCodeToPNGBytes(q *qrcode.QRCode, size int) ([]byte, error) {
	var buf bytes.Buffer
	err := q.Write(size, &buf)
	if err != nil {
		return nil, fmt.Errorf("生成PNG失败: %w", err)
	}
	return buf.Bytes(), nil
}

// ResizeQRCode 调整二维码大小并返回新的字节数组
func ResizeQRCode(qrBytes []byte, newSize int) ([]byte, error) {
	img, err := png.Decode(bytes.NewReader(qrBytes))
	if err != nil {
		return nil, fmt.Errorf("解码PNG失败: %w", err)
	}

	var buf bytes.Buffer
	err = png.Encode(&buf, img)
	if err != nil {
		return nil, fmt.Errorf("编码PNG失败: %w", err)
	}

	return buf.Bytes(), nil
}
