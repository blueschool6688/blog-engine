package translate

import (
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"time"

	"backend/pkg/cache"
)

// TranslateCache là interface trừu tượng cho việc cache kết quả dịch.
// Sử dụng interface để dễ dàng mock trong unit test.
type TranslateCache interface {
	Get(ctx context.Context, key string) (string, bool)
	Set(ctx context.Context, key string, value string, ttl time.Duration)
}

// memcachedTranslateCache là implementation của TranslateCache dùng Memcached có sẵn trong dự án.
type memcachedTranslateCache struct {
	store *cache.MemcachedStore
}

// NewMemcachedTranslateCache tạo một TranslateCache mới dùng Memcached.
func NewMemcachedTranslateCache(store *cache.MemcachedStore) TranslateCache {
	return &memcachedTranslateCache{store: store}
}

// makeCacheKey tạo cache key theo format: "translate:{sha256(content)}:{targetLang}"
// Dùng SHA-256 để đảm bảo key hợp lệ và duy nhất theo nội dung.
func makeCacheKey(content, targetLang string) string {
	hash := sha256.Sum256([]byte(content))
	return fmt.Sprintf("translate:%x:%s", hash, targetLang)
}

// Get lấy bản dịch từ cache. Trả về (value, true) nếu có, ("", false) nếu cache miss.
func (c *memcachedTranslateCache) Get(ctx context.Context, key string) (string, bool) {
	var result string
	if err := c.store.Get(ctx, key, &result); err != nil {
		if errors.Is(err, cache.ErrCacheMiss) {
			return "", false
		}
		// Lỗi kết nối hoặc lỗi khác — treat as miss, không để crash
		return "", false
	}
	return result, true
}

// Set lưu bản dịch vào cache với TTL xác định.
// Lỗi lưu cache không quan trọng — bỏ qua để không ảnh hưởng luồng chính.
func (c *memcachedTranslateCache) Set(ctx context.Context, key string, value string, ttl time.Duration) {
	_ = c.store.Set(ctx, key, value, ttl)
}
