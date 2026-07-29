# ═══════════════════════════════════════════════════════════════
# Backend Dockerfile — Multi-stage build (Go 1.25)
# Produces 3 static binaries: /cms, /worker, /migrate
# Final image: distroless (~5MB, no shell, maximum security)
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Download dependencies ───────────────────────────
FROM golang:1.25-alpine AS deps
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# ── Stage 2: Build all binaries ──────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .

# API server
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -trimpath \
    -o /out/cms ./cmd/api/main.go

# Background worker (media processing, scheduled publish)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -trimpath \
    -o /out/worker ./cmd/worker/main.go

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -trimpath \
    -o /out/migrate ./cmd/migrate/main.go

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -trimpath \
    -o /out/seed ./cmd/seed/main.go

# ── Stage 3: Minimal runtime ────────────────────────────────
FROM gcr.io/distroless/static-debian12 AS runtime
WORKDIR /app

COPY --from=builder /out/cms     /cms
COPY --from=builder /out/worker  /worker
COPY --from=builder /out/migrate /migrate
COPY --from=builder /out/seed    /seed
COPY --from=builder /app/migrations /app/migrations

EXPOSE 8080

CMD ["/cms"]
