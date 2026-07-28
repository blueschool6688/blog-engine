.PHONY: dev build up down logs migrate prod prod-down prod-logs

# ── Development ──────────────────────────────────────────────
dev:
	docker compose up --build

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose run --rm migrate

# ── Production ───────────────────────────────────────────────
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml \
		--env-file .env.docker up -d --build

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml \
		--env-file .env.docker down

prod-logs:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml \
		--env-file .env.docker logs -f
