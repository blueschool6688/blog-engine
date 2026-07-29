.PHONY: dev build up down logs migrate prod prod-down prod-logs create-network

create-network:
	docker network create blogs_backend_net || true

# ── Development ──────────────────────────────────────────────
dev: create-network
	docker compose up --build

build:
	docker compose build

up: create-network
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

migrate: create-network
	docker compose run --rm migrate

# ── Production ───────────────────────────────────────────────
prod: create-network
	docker compose -f docker-compose.yml -f docker-compose.prod.yml \
		--env-file .env.docker up -d --build

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml \
		--env-file .env.docker down

prod-logs:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml \
		--env-file .env.docker logs -f
