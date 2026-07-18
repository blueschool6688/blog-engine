# ╔══════════════════════════════════════════════════════════════════╗
# ║               Blog Engine — Backend Makefile                    ║
# ║  Requires: GNU Make (Git Bash / WSL / make for Windows)         ║
# ║  For pure Windows CMD/PowerShell use scripts/migrate.ps1        ║
# ╚══════════════════════════════════════════════════════════════════╝

.PHONY: help \
        migrate-up migrate-down migrate-down-all migrate-status migrate-force migrate-create \
        db-seed build run

# ─── Variables ───────────────────────────────────────────────────────────────
MIGRATE := go run ./cmd/migrate
SEED := go run ./cmd/seed
MIGRATIONS_DIR := ./migrations
BINARY := cms.exe

# ─── Default target ──────────────────────────────────────────────────────────
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo ""
	@echo "  ╔═══════════════════════════════════════════════════════╗"
	@echo "  ║            Blog Engine — Make Commands                ║"
	@echo "  ╠═══════════════════════════════════════════════════════╣"
	@echo "  ║  MIGRATIONS                                           ║"
	@echo "  ║  make migrate-up              Apply all pending       ║"
	@echo "  ║  make migrate-down            Roll back last 1 step   ║"
	@echo "  ║  make migrate-down STEPS=N    Roll back N steps       ║"
	@echo "  ║  make migrate-down-all        Roll back everything     ║"
	@echo "  ║  make migrate-status          Show current version     ║"
	@echo "  ║  make migrate-force V=3       Force set version        ║"
	@echo "  ║  make migrate-create N=name   Create new SQL files     ║"
	@echo "  ║  make db-seed                 Seed DB with dummy data  ║"
	@echo "  ╠═══════════════════════════════════════════════════════╣"
	@echo "  ║  APP                                                  ║"
	@echo "  ║  make build                   Build $(BINARY)          ║"
	@echo "  ║  make run                     Run dev server           ║"
	@echo "  ╚═══════════════════════════════════════════════════════╝"
	@echo ""

# ─── Migration commands ───────────────────────────────────────────────────────

## Apply all pending migrations
migrate-up:
	@echo "▶  Applying all pending migrations..."
	$(MIGRATE) -action=up

## Roll back the last migration (use STEPS=N for multiple, e.g. make migrate-down STEPS=2)
STEPS ?= 1
migrate-down:
	@echo "▶  Rolling back $(STEPS) step(s)..."
	$(MIGRATE) -action=down -steps=$(STEPS)

## Roll back ALL migrations (destructive — drops all data!)
migrate-down-all:
	@echo "⚠️   WARNING: Rolling back ALL migrations. All data will be lost."
	@read -p "    Are you sure? [y/N]: " ans && [ "$$ans" = "y" ] || exit 1
	$(MIGRATE) -action=down-all

## Show current migration version and dirty status
migrate-status:
	$(MIGRATE) -action=status

## Force-set a migration version to recover from a dirty state
## Usage: make migrate-force V=3
migrate-force:
	@if [ -z "$(V)" ]; then \
		echo "❌  Usage: make migrate-force V=<version_number>"; \
		exit 1; \
	fi
	$(MIGRATE) -action=force -version=$(V)

## Create a new pair of up/down SQL migration files
## Usage: make migrate-create N=add_tags_table
migrate-create:
	@if [ -z "$(N)" ]; then \
		echo "❌  Usage: make migrate-create N=<snake_case_name>"; \
		exit 1; \
	fi
	@NEXT=$$(ls $(MIGRATIONS_DIR)/*.up.sql 2>/dev/null | wc -l | tr -d ' '); \
	NEXT=$$((NEXT + 1)); \
	NUM=$$(printf "%06d" $$NEXT); \
	UP="$(MIGRATIONS_DIR)/$${NUM}_$(N).up.sql"; \
	DOWN="$(MIGRATIONS_DIR)/$${NUM}_$(N).down.sql"; \
	touch "$$UP" "$$DOWN"; \
	echo "✅  Created:"; \
	echo "    $$UP"; \
	echo "    $$DOWN"

# ─── App commands ─────────────────────────────────────────────────────────────

## Seed the database with default admin user and demo posts
db-seed:
	@echo "▶  Seeding database..."
	$(SEED)

## Build the production binary
build:
	@echo "▶  Building $(BINARY)..."
	go build -o $(BINARY) ./cmd/api/main.go
	@echo "✅  Built: $(BINARY)"

## Run the development server
run:
	@echo "▶  Starting dev server..."
	go run ./cmd/api/main.go
