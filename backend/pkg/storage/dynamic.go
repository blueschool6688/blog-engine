package storage

import (
	"context"
	"io"
	"sync"

	"backend/pkg/config"
	"gorm.io/gorm"
)

// DynamicStorage wrapper giúp tự động load/switch driver từ database settings
type DynamicStorage struct {
	db       *gorm.DB
	cfg      *config.Config
	mu       sync.RWMutex
	active   Storage
}

func NewDynamicStorage(db *gorm.DB, cfg *config.Config) *DynamicStorage {
	ds := &DynamicStorage{
		db:  db,
		cfg: cfg,
	}
	ds.Reload(context.Background())
	return ds
}

func (d *DynamicStorage) Reload(ctx context.Context) {
	d.mu.Lock()
	defer d.mu.Unlock()

	provider := d.cfg.StorageProvider
	endpoint := d.cfg.S3Endpoint
	region := d.cfg.S3Region
	bucket := d.cfg.S3Bucket
	accessKey := d.cfg.S3AccessKey
	secretKey := d.cfg.S3SecretKey

	type Setting struct {
		Key   string
		Value string
	}
	var settings []Setting
	if err := d.db.WithContext(ctx).Table("settings").Find(&settings).Error; err == nil {
		for _, s := range settings {
			switch s.Key {
			case "storage_provider":
				if s.Value != "" {
					provider = s.Value
				}
			case "s3_endpoint":
				if s.Value != "" {
					endpoint = s.Value
				}
			case "s3_region":
				if s.Value != "" {
					region = s.Value
				}
			case "s3_bucket":
				if s.Value != "" {
					bucket = s.Value
				}
			case "s3_access_key":
				if s.Value != "" {
					accessKey = s.Value
				}
			case "s3_secret_key":
				if s.Value != "" {
					secretKey = s.Value
				}
			}
		}
	}

	// Khởi tạo Driver tương ứng
	if provider == "local" || provider == "" {
		d.active = NewLocalStorage(d.cfg.UploadsDir, d.cfg.AppURL)
	} else {
		s3Driver, err := NewS3Storage(provider, endpoint, region, bucket, accessKey, secretKey)
		if err != nil {
			// Fallback về local nếu cấu hình S3 từ DB bị lỗi để tránh crash hệ thống
			d.active = NewLocalStorage(d.cfg.UploadsDir, d.cfg.AppURL)
		} else {
			d.active = s3Driver
		}
	}
}

// Thực hiện triển khai Interface Storage cho DynamicStorage

func (d *DynamicStorage) DriverName() string {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.active.DriverName()
}

func (d *DynamicStorage) UploadFile(ctx context.Context, key string, reader io.Reader, contentType string) error {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.active.UploadFile(ctx, key, reader, contentType)
}

func (d *DynamicStorage) DeleteObject(ctx context.Context, key string) error {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.active.DeleteObject(ctx, key)
}

func (d *DynamicStorage) GetPublicURL(key string) string {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.active.GetPublicURL(key)
}

func (d *DynamicStorage) DownloadFile(ctx context.Context, key string) (io.ReadCloser, error) {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.active.DownloadFile(ctx, key)
}
