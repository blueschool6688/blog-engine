package storage

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"
)

// Storage định nghĩa interface chung cho mọi storage providers
type Storage interface {
	// DriverName trả về tên driver (ví dụ: 'local', 's3', 'minio')
	DriverName() string
	UploadFile(ctx context.Context, key string, reader io.Reader, contentType string) error
	DeleteObject(ctx context.Context, key string) error
	GetPublicURL(key string) string
	DownloadFile(ctx context.Context, key string) (io.ReadCloser, error)
}

// BuildKey tạo object key dạng "folder/YYYY/MM/DD/timestamp_name.ext"
func BuildKey(folder, originalName string) string {
	now := time.Now()
	ext := ""
	if idx := strings.LastIndex(originalName, "."); idx >= 0 {
		ext = originalName[idx:]
	}
	// Thay thế ký tự lạ để tránh lỗi path key
	safeName := strings.ReplaceAll(originalName, " ", "_")
	if len(safeName) > 50 {
		safeName = safeName[:50] + ext
	}
	return fmt.Sprintf("%s/%d/%02d/%02d/%d_%s",
		folder,
		now.Year(), now.Month(), now.Day(),
		now.UnixNano(),
		safeName,
	)
}

// BuildThumbnailKey tạo key cho file thumbnail từ key file gốc
func BuildThumbnailKey(originalKey string) string {
	dot := strings.LastIndex(originalKey, ".")
	if dot < 0 {
		return originalKey + "_thumb"
	}
	return originalKey[:dot] + "_thumb" + originalKey[dot:]
}
