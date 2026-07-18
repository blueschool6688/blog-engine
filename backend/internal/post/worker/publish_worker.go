package worker

import (
	"context"
	"time"

	"backend/pkg/cache"
	"backend/pkg/logger"
	"gorm.io/gorm"
)

type PublishWorker struct {
	db         *gorm.DB
	cacheStore *cache.MemcachedStore
	logger     *logger.Logger
}

func NewPublishWorker(db *gorm.DB, cacheStore *cache.MemcachedStore, logger *logger.Logger) *PublishWorker {
	return &PublishWorker{
		db:         db,
		cacheStore: cacheStore,
		logger:     logger,
	}
}

func (w *PublishWorker) Start(ctx context.Context) {
	w.logger.Info("Starting Scheduled Publish Worker...")

	ticker := time.NewTicker(1 * time.Minute)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				w.logger.Info("Stopping Scheduled Publish Worker...")
				return
			case <-ticker.C:
				w.PublishPendingPosts(ctx)
			}
		}
	}()
}

func (w *PublishWorker) PublishPendingPosts(ctx context.Context) {
	result := w.db.WithContext(ctx).
		Exec("UPDATE posts SET status = 'published' WHERE status = 'draft' AND published_at <= NOW() AND deleted_at IS NULL")
	if result.Error != nil {
		w.logger.Error("Scheduled Publish Worker error: %v", result.Error)
		return
	}

	if result.RowsAffected > 0 {
		w.logger.Info("Scheduled Publish Worker: published %d posts, invalidating cache version.", result.RowsAffected)
		_, err := w.cacheStore.Increment(ctx, "posts:version", 1)
		if err != nil {
			w.logger.Error("Scheduled Publish Worker failed to increment posts:version cache key: %v", err)
		}
	}
}
