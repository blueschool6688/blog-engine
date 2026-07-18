package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/bradfitz/gomemcache/memcache"
)

var ErrCacheMiss = errors.New("cache miss")

type MemcachedStore struct {
	client *memcache.Client
}

func NewMemcachedStore(addr string) *MemcachedStore {
	return &MemcachedStore{
		client: memcache.New(addr),
	}
}

func (s *MemcachedStore) Ping() error {
	return s.client.Ping()
}

func (s *MemcachedStore) Get(ctx context.Context, key string, dest interface{}) error {
	item, err := s.client.Get(key)
	if err != nil {
		if errors.Is(err, memcache.ErrCacheMiss) {
			return fmt.Errorf("memcached get: %w", ErrCacheMiss)
		}
		return fmt.Errorf("memcached get: %w", err)
	}
	if err := json.Unmarshal(item.Value, dest); err != nil {
		return fmt.Errorf("memcached unmarshal: %w", err)
	}
	return nil
}

func (s *MemcachedStore) Set(ctx context.Context, key string, val interface{}, expiration time.Duration) error {
	data, err := json.Marshal(val)
	if err != nil {
		return fmt.Errorf("memcached marshal: %w", err)
	}
	err = s.client.Set(&memcache.Item{
		Key:        key,
		Value:      data,
		Expiration: int32(expiration.Seconds()),
	})
	if err != nil {
		return fmt.Errorf("memcached set: %w", err)
	}
	return nil
}

func (s *MemcachedStore) Delete(ctx context.Context, key string) error {
	err := s.client.Delete(key)
	if err != nil && !errors.Is(err, memcache.ErrCacheMiss) {
		return fmt.Errorf("memcached delete: %w", err)
	}
	return nil
}

func (s *MemcachedStore) Increment(ctx context.Context, key string, delta uint64) (uint64, error) {
	val, err := s.client.Increment(key, delta)
	if err != nil {
		if errors.Is(err, memcache.ErrCacheMiss) {
			err = s.client.Set(&memcache.Item{
				Key:        key,
				Value:      []byte("1"),
				Expiration: 0,
			})
			if err != nil {
				return 0, fmt.Errorf("memcached init increment: %w", err)
			}
			return 1, nil
		}
		return 0, fmt.Errorf("memcached increment: %w", err)
	}
	return val, nil
}
