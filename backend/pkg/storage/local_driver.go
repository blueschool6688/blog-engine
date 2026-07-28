package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

type LocalStorage struct {
	uploadsDir string
	appURL     string
}

func NewLocalStorage(uploadsDir, appURL string) *LocalStorage {
	return &LocalStorage{
		uploadsDir: uploadsDir,
		appURL:     appURL,
	}
}

func (l *LocalStorage) DriverName() string {
	return "local"
}

func (l *LocalStorage) UploadFile(ctx context.Context, key string, reader io.Reader, contentType string) error {
	fullPath := filepath.Join(l.uploadsDir, key)
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("local: create dir: %w", err)
	}

	out, err := os.Create(fullPath)
	if err != nil {
		return fmt.Errorf("local: create file: %w", err)
	}
	defer out.Close()

	if _, err := io.Copy(out, reader); err != nil {
		return fmt.Errorf("local: copy content: %w", err)
	}
	return nil
}

func (l *LocalStorage) DeleteObject(ctx context.Context, key string) error {
	if key == "" {
		return nil
	}
	fullPath := filepath.Join(l.uploadsDir, key)
	_ = os.Remove(fullPath)
	return nil
}

func (l *LocalStorage) GetPublicURL(key string) string {
	// Trả về dạng /uploads/images/2026/... giống codebase cũ hoặc kèm theo appURL
	return "/uploads/" + key
}

func (l *LocalStorage) DownloadFile(ctx context.Context, key string) (io.ReadCloser, error) {
	fullPath := filepath.Join(l.uploadsDir, key)
	file, err := os.Open(fullPath)
	if err != nil {
		return nil, fmt.Errorf("local: open file %q: %w", key, err)
	}
	return file, nil
}
