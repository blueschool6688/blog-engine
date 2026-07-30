// cmd/migrate/main.go
// Standalone migration CLI tool using golang-migrate.
//
// Usage (from backend/ directory):
//
//	go run ./cmd/migrate -action=up
//	go run ./cmd/migrate -action=down
//	go run ./cmd/migrate -action=down-all
//	go run ./cmd/migrate -action=status
//	go run ./cmd/migrate -action=force  -version=3
//	go run ./cmd/migrate -action=down   -steps=2
//
// Or via Makefile (see backend/Makefile):
//
//	make migrate-up
//	make migrate-down
//	make migrate-status
//	make migrate-create N=add_tags_table
package main

import (
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/joho/godotenv"
)

func main() {
	action := flag.String("action", "up", "Action: up | down | down-all | status | force")
	steps := flag.Int("steps", 1, "Number of steps for 'down' action")
	version := flag.Int("version", -1, "Target version for 'force' action")
	flag.Parse()

	loadEnv()

	dsn := buildDSN()
	migrationsPath := resolveMigrationsDir()

	sourceURL := fmt.Sprintf("file://%s", filepath.ToSlash(migrationsPath))

	m, err := migrate.New(sourceURL, dsn)
	if err != nil {
		log.Fatalf("❌  Failed to create migrator: %v\n", err)
	}
	defer func() {
		srcErr, dbErr := m.Close()
		if srcErr != nil {
			log.Printf("⚠️   migrate source close error: %v\n", srcErr)
		}
		if dbErr != nil {
			log.Printf("⚠️   migrate db close error: %v\n", dbErr)
		}
	}()

	// Attach structured logger so migration steps are visible
	m.Log = &migrateLogger{}

	switch strings.ToLower(*action) {

	// ── apply all pending migrations ─────────────────────────────────────────
	case "up":
		fmt.Println("▶  Running all pending migrations...")
		if err := m.Up(); err != nil {
			if errors.Is(err, migrate.ErrNoChange) {
				fmt.Println("✅  Schema is already up to date. No migrations applied.")
			} else {
				log.Fatalf("❌  Migration up failed: %v\n", err)
			}
			return
		}
		v, _, _ := m.Version()
		fmt.Printf("✅  All migrations applied. Current version: %d\n", v)

	// ── roll back N steps (default 1) ────────────────────────────────────────
	case "down":
		fmt.Printf("▶  Rolling back %d step(s)...\n", *steps)
		if err := m.Steps(-(*steps)); err != nil {
			if errors.Is(err, migrate.ErrNoChange) {
				fmt.Println("✅  Nothing to roll back.")
			} else {
				log.Fatalf("❌  Migration down failed: %v\n", err)
			}
			return
		}
		v, _, verErr := m.Version()
		if errors.Is(verErr, migrate.ErrNilVersion) {
			fmt.Printf("✅  Rolled back %d step(s). No migrations remain.\n", *steps)
		} else {
			fmt.Printf("✅  Rolled back %d step(s). Current version: %d\n", *steps, v)
		}

	// ── roll back everything ──────────────────────────────────────────────────
	case "down-all":
		fmt.Println("▶  Rolling back ALL migrations...")
		if err := m.Down(); err != nil {
			if errors.Is(err, migrate.ErrNoChange) {
				fmt.Println("✅  Nothing to roll back.")
			} else {
				log.Fatalf("❌  Migration down-all failed: %v\n", err)
			}
			return
		}
		fmt.Println("✅  All migrations rolled back. Database is clean.")

	// ── show current version ──────────────────────────────────────────────────
	case "status":
		v, dirty, err := m.Version()
		if err != nil {
			if errors.Is(err, migrate.ErrNilVersion) {
				fmt.Println("📋  No migrations applied yet (version: none).")
			} else {
				log.Fatalf("❌  Failed to query version: %v\n", err)
			}
			return
		}
		dirtyStr := ""
		if dirty {
			dirtyStr = " ⚠️  DIRTY — run 'make migrate-force V=<version>' to fix"
		}
		fmt.Printf("📋  Current version: %d%s\n", v, dirtyStr)

	// ── force-set version (recover from dirty state) ──────────────────────────
	case "force":
		if *version < 0 {
			log.Fatal("❌  -version flag is required for 'force' action. Example: -version=3")
		}
		if err := m.Force(*version); err != nil {
			log.Fatalf("❌  Force failed: %v\n", err)
		}
		fmt.Printf("✅  Forced migration version to %d. The dirty flag has been cleared.\n", *version)

	default:
		log.Fatalf("❌  Unknown action: %q. Valid actions: up | down | down-all | status | force\n", *action)
	}
}

// ── helpers ───────────────────────────────────────────────────────────────────

// loadEnv attempts to load a .env file from the current directory or parent
// directories (supports running from backend/ or backend/cmd/migrate/).
func loadEnv() {
	candidates := []string{".env", "../.env", "../../.env"}
	for _, p := range candidates {
		if _, err := os.Stat(p); err == nil {
			if err := godotenv.Load(p); err != nil {
				log.Printf("⚠️   Could not parse %s: %v\n", p, err)
			}
			return
		}
	}
	// Not fatal — environment variables may be set directly in the shell.
}

// buildDSN constructs a postgres:// DSN from environment variables.
func buildDSN() string {
	host := getEnv("DB_HOST", "127.0.0.1")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "root")
	dbname := getEnv("DB_NAME", "blogs")
	sslmode := getEnv("DB_SSLMODE", "disable")
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		user, password, host, port, dbname, sslmode,
	)
}

// resolveMigrationsDir returns the absolute path to the migrations/ directory.
// Handles being run from backend/, backend/cmd/migrate/, or via `go run ./...`.
func resolveMigrationsDir() string {
	candidates := []string{
		"./migrations",
		"../migrations",
		"../../migrations",
	}
	for _, rel := range candidates {
		abs, err := filepath.Abs(rel)
		if err != nil {
			continue
		}
		if info, err := os.Stat(abs); err == nil && info.IsDir() {
			return abs
		}
	}
	log.Fatal("❌  Cannot locate the migrations/ directory.\n    Run this command from the backend/ directory.")
	return ""
}

// getEnv returns the value of an environment variable or a default.
func getEnv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}

// ── migrateLogger adapts golang-migrate's Logger interface ───────────────────

type migrateLogger struct{}

func (l *migrateLogger) Printf(format string, v ...interface{}) {
	fmt.Printf("   "+format, v...)
}

func (l *migrateLogger) Verbose() bool { return true }
