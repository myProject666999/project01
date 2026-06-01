package utils

import (
	"encoding/base64"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func SaveUploadedFile(file *multipart.FileHeader, uploadDir string, allowedTypes []string) (string, error) {
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if len(allowedTypes) > 0 {
		allowed := false
		for _, allowedExt := range allowedTypes {
			if ext == allowedExt {
				allowed = true
				break
			}
		}
		if !allowed {
			return "", fmt.Errorf("file type not allowed: %s", ext)
		}
	}

	fileName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), GenerateRandomString(8), ext)
	filePath := filepath.Join(uploadDir, fileName)

	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	if _, err := dst.ReadFrom(src); err != nil {
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	return filePath, nil
}

func SaveBase64Image(base64Data string, uploadDir string) (string, error) {
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	var ext string

	if strings.HasPrefix(base64Data, "data:image/png;base64,") {
		base64Data = strings.TrimPrefix(base64Data, "data:image/png;base64,")
		ext = ".png"
	} else if strings.HasPrefix(base64Data, "data:image/jpeg;base64,") {
		base64Data = strings.TrimPrefix(base64Data, "data:image/jpeg;base64,")
		ext = ".jpg"
	} else if strings.HasPrefix(base64Data, "data:image/jpg;base64,") {
		base64Data = strings.TrimPrefix(base64Data, "data:image/jpg;base64,")
		ext = ".jpg"
	} else {
		ext = ".png"
	}

	imageData, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64 image: %w", err)
	}

	fileName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), GenerateRandomString(8), ext)
	filePath := filepath.Join(uploadDir, fileName)

	if err := os.WriteFile(filePath, imageData, 0644); err != nil {
		return "", fmt.Errorf("failed to save image: %w", err)
	}

	return filePath, nil
}
