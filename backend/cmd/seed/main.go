// cmd/seed/main.go
// Standalone database seeder CLI tool.
//
// Usage (from backend/ directory):
//	go run ./cmd/seed
//
// Or via Makefile (see backend/Makefile):
//	make db-seed
//
// Or via PowerShell (see backend/scripts/migrate.ps1):
//	.\scripts\migrate.ps1 seed
package main

import (
	"os"

	"backend/internal/seeds"
	"backend/pkg/config"
	"backend/pkg/database"
	"backend/pkg/logger"
)

func main() {
	appLog := logger.New()
	cfg := config.Load()

	appLog.Info("Connecting to PostgreSQL database to run seeds...\n")
	db, err := database.Connect(cfg)
	if err != nil {
		appLog.Error("Database connection failed: %v\n", err)
		os.Exit(1)
	}

	appLog.Info("Database connection established. Starting seeder process...\n")
	if err := seeds.Run(db); err != nil {
		appLog.Error("Seeding failed: %v\n", err)
		os.Exit(1)
	}

	appLog.Info("Seeder finished execution.\n")
}
