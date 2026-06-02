package utils

import (
	"fmt"
	"image"
	"image/draw"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/golang/freetype"
	"github.com/golang/freetype/truetype"
	"golang.org/x/image/font"
	"golang.org/x/image/math/fixed"
)

const (
	uploadDir    = "./uploads"
	imageDir     = "./uploads/images"
	maxImageSize = 10 << 20
)

var allowedImageTypes = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
}

func init() {
	_ = os.MkdirAll(uploadDir, 0755)
	_ = os.MkdirAll(imageDir, 0755)
}

func UploadImage(file *multipart.FileHeader, vin string) (string, error) {
	if file.Size > maxImageSize {
		return "", fmt.Errorf("图片大小不能超过10MB")
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedImageTypes[ext] {
		return "", fmt.Errorf("不支持的图片格式，仅支持jpg、jpeg、png、gif")
	}

	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("打开文件失败: %v", err)
	}
	defer src.Close()

	fileName := fmt.Sprintf("%s_%d%s", vin, time.Now().UnixNano(), ext)
	filePath := filepath.Join(imageDir, fileName)

	tempPath := filePath + ".temp"
	dst, err := os.Create(tempPath)
	if err != nil {
		return "", fmt.Errorf("创建文件失败: %v", err)
	}

	_, err = io.Copy(dst, src)
	dst.Close()
	if err != nil {
		os.Remove(tempPath)
		return "", fmt.Errorf("保存文件失败: %v", err)
	}

	err = os.Rename(tempPath, filePath)
	if err != nil {
		os.Remove(tempPath)
		return "", fmt.Errorf("重命名文件失败: %v", err)
	}
	AddWatermark(filePath, vin)

	return filePath, nil
}

func AddWatermark(filePath, vin string) error {
	ext := strings.ToLower(filepath.Ext(filePath))
	
	srcFile, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	var img image.Image
	switch ext {
	case ".jpg", ".jpeg":
		img, err = jpeg.Decode(srcFile)
	case ".png":
		img, err = png.Decode(srcFile)
	default:
		img, _, err = image.Decode(srcFile)
	}
	if err != nil {
		return err
	}

	bounds := img.Bounds()
	rgba := image.NewRGBA(bounds)
	draw.Draw(rgba, bounds, img, bounds.Min, draw.Src)

	fontBytes, err := loadFont()
	if err != nil {
		return nil
	}

	f, err := freetype.ParseFont(fontBytes)
	if err != nil {
		return nil
	}

	fontSize := float64(bounds.Dx()) / 30
	if fontSize < 12 {
		fontSize = 12
	}
	if fontSize > 48 {
		fontSize = 48
	}

	face := truetype.NewFace(f, &truetype.Options{
		Size:    fontSize,
		DPI:     72,
		Hinting: font.HintingFull,
	})

	watermarkText := fmt.Sprintf("VIN:%s %s", vin, time.Now().Format("2006-01-02 15:04:05"))

	d := &font.Drawer{
		Dst:  rgba,
		Src:  image.White,
		Face: face,
		Dot:  fixed.P(bounds.Min.X+10, bounds.Max.Y-10),
	}

	d.DrawString(watermarkText)

	dstFile, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	return encodeImage(dstFile, rgba, ext)
}

func encodeImage(w io.Writer, img image.Image, ext string) error {
	switch ext {
	case ".jpg", ".jpeg":
		return jpeg.Encode(w, img, &jpeg.Options{Quality: 90})
	case ".png":
		return png.Encode(w, img)
	default:
		return jpeg.Encode(w, img, &jpeg.Options{Quality: 90})
	}
}

func loadFont() ([]byte, error) {
	fontPaths := []string{
		"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
		"/usr/share/fonts/TTF/DejaVuSans.ttf",
		"C:\\Windows\\Fonts\\arial.ttf",
		"C:\\Windows\\Fonts\\simhei.ttf",
		"./fonts/arial.ttf",
	}

	for _, path := range fontPaths {
		if _, err := os.Stat(path); err == nil {
			return os.ReadFile(path)
		}
	}

	return nil, fmt.Errorf("未找到字体文件")
}

func DeleteFile(filePath string) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil
	}
	return os.Remove(filePath)
}

func GetFileURL(filePath string) string {
	return strings.Replace(filePath, "./", "/", 1)
}
