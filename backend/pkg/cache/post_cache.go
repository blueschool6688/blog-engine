package cache

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"time"
)

type PostCache struct {
	store *MemcachedStore
}

func NewPostCache(store *MemcachedStore) *PostCache {
	return &PostCache{store: store}
}

func (pc *PostCache) Store() *MemcachedStore {
	return pc.store
}

// executeWithTimeout wraps cache operations with a strict 200ms timeout context.
// It fails back to DB on Memcached down or slow responses.
func (pc *PostCache) executeWithTimeout(ctx context.Context, op func(ctx context.Context) error) error {
	timeoutCtx, cancel := context.WithTimeout(ctx, 200*time.Millisecond)
	defer cancel()

	errChan := make(chan error, 1)
	go func() {
		errChan <- op(timeoutCtx)
	}()

	select {
	case err := <-errChan:
		return err
	case <-timeoutCtx.Done():
		return timeoutCtx.Err()
	}
}

// ─── Post HTML Caching (Lưu chuỗi JSON hoặc nội dung HTML) ───

func (pc *PostCache) GetPostHTML(ctx context.Context, slug string) (string, bool, error) {
	var jsonStr string
	key := fmt.Sprintf("post:html:%s", slug)
	err := pc.executeWithTimeout(ctx, func(c context.Context) error {
		return pc.store.Get(c, key, &jsonStr)
	})
	if err != nil {
		return "", false, err
	}
	return jsonStr, true, nil
}

func (pc *PostCache) SetPostHTML(ctx context.Context, slug string, html string, ttl int32) error {
	key := fmt.Sprintf("post:html:%s", slug)
	// Memcached limit is 1MB (1,048,576 bytes)
	if len(html) >= 1048576 {
		log.Printf("[WARNING] HTML content for slug %s is too large (%d bytes), skipping cache.", slug, len(html))
		return nil
	}
	return pc.executeWithTimeout(ctx, func(c context.Context) error {
		return pc.store.Set(c, key, html, time.Duration(ttl)*time.Second)
	})
}

func (pc *PostCache) DeletePostHTML(ctx context.Context, slug string) error {
	key := fmt.Sprintf("post:html:%s", slug)
	return pc.executeWithTimeout(ctx, func(c context.Context) error {
		return pc.store.Delete(c, key)
	})
}

// ─── Post Listing Caching ───

func (pc *PostCache) GetPostList(ctx context.Context, page int, status string) ([]byte, bool, error) {
	var data []byte
	key := fmt.Sprintf("post:list:%s:page:%d", status, page)
	err := pc.executeWithTimeout(ctx, func(c context.Context) error {
		return pc.store.Get(c, key, &data)
	})
	if err != nil {
		return nil, false, err
	}
	return data, true, nil
}

func (pc *PostCache) SetPostList(ctx context.Context, page int, status string, data []byte, ttl int32) error {
	key := fmt.Sprintf("post:list:%s:page:%d", status, page)
	if len(data) >= 1048576 {
		log.Printf("[WARNING] Post list data for page %d status %s is too large (%d bytes), skipping cache.", page, status, len(data))
		return nil
	}
	return pc.executeWithTimeout(ctx, func(c context.Context) error {
		return pc.store.Set(c, key, data, time.Duration(ttl)*time.Second)
	})
}

func (pc *PostCache) InvalidatePostLists(ctx context.Context) error {
	// Invalidate first 5 pages of active listings (draft/published)
	for page := 1; page <= 5; page++ {
		keyPub := fmt.Sprintf("post:list:published:page:%d", page)
		keyDraft := fmt.Sprintf("post:list:draft:page:%d", page)
		_ = pc.executeWithTimeout(ctx, func(c context.Context) error {
			_ = pc.store.Delete(c, keyPub)
			_ = pc.store.Delete(c, keyDraft)
			return nil
		})
	}
	// Also increment version key if existing code relies on it
	_ = pc.executeWithTimeout(ctx, func(c context.Context) error {
		_, _ = pc.store.Increment(c, "posts:version", 1)
		return nil
	})
	return nil
}

// ─── Search Results Caching ───

func (pc *PostCache) GetSearchResult(ctx context.Context, queryHash string) ([]byte, bool, error) {
	var data []byte
	key := fmt.Sprintf("search:%s", queryHash)
	err := pc.executeWithTimeout(ctx, func(c context.Context) error {
		return pc.store.Get(c, key, &data)
	})
	if err != nil {
		return nil, false, err
	}
	return data, true, nil
}

func (pc *PostCache) SetSearchResult(ctx context.Context, queryHash string, data []byte, ttl int32) error {
	key := fmt.Sprintf("search:%s", queryHash)
	if len(data) >= 1048576 {
		log.Printf("[WARNING] Search results for hash %s is too large (%d bytes), skipping cache.", queryHash, len(data))
		return nil
	}
	return pc.executeWithTimeout(ctx, func(c context.Context) error {
		return pc.store.Set(c, key, data, time.Duration(ttl)*time.Second)
	})
}

func HashQuery(query string) string {
	hasher := sha256.New()
	hasher.Write([]byte(query))
	return hex.EncodeToString(hasher.Sum(nil))
}
