package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/internal/translate"
	"backend/pkg/cache"
	"backend/pkg/config"
	"backend/pkg/database"
	"backend/pkg/logger"
)

func main() {
	// Graceful shutdown: lắng nghe SIGINT và SIGTERM
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	log.Println("[worker] Starting translate worker...")

	// Load config
	cfg := config.Load()
	appLog := logger.New()

	// Kết nối PostgreSQL
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("[worker] Database connection failed: %v", err)
	}
	appLog.Info("[worker] Connected to PostgreSQL.\n")

	// Khởi tạo cache store
	cacheStore := cache.NewMemcachedStore(cfg.MemcachedAddr)
	if err := cacheStore.Ping(); err != nil {
		appLog.Error("[worker] Memcached connection failed (cache disabled): %v\n", err)
	} else {
		appLog.Info("[worker] Memcached connected.\n")
	}

	// Validate NVIDIA API key
	if cfg.NVIDIAAPIKey == "" {
		log.Fatal("[worker] NVIDIA_API_KEY is not set in .env")
	}

	// Khởi tạo translate domain
	nvidiaClient := translate.NewNVIDIAClient(cfg.NVIDIAAPIKey, cfg.NVIDIAModel)
	translateCache := translate.NewMemcachedTranslateCache(cacheStore)
	jobStore := translate.NewPostgresJobStore(db)
	svc := translate.NewService(nvidiaClient, translateCache, appLog, cfg.TranslateChunkSize, jobStore)

	appLog.Info("[worker] Ready. Polling translate_jobs every 2s...\n")
	fmt.Println("[worker] Press Ctrl+C to stop.")

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			appLog.Info("[worker] Shutting down gracefully...\n")
			return

		case <-ticker.C:
			processed, err := svc.ProcessNextJob(ctx)
			if err != nil {
				appLog.Error("[worker] ProcessNextJob error: %v\n", err)
			}
			if processed {
				appLog.Info("[worker] Job processed successfully.\n")
			}
		}
	}
}
