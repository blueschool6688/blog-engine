#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# infra.sh — Khởi động PostgreSQL + Memcached bằng docker run
# Dùng cho môi trường dev local (không cần docker compose)
#
# Cách dùng:
#   chmod +x scripts/infra.sh
#   ./scripts/infra.sh          → khởi động
#   ./scripts/infra.sh stop     → dừng
#   ./scripts/infra.sh restart  → dừng rồi khởi động lại
#   ./scripts/infra.sh status   → xem trạng thái
#   ./scripts/infra.sh logs     → xem logs realtime
# ─────────────────────────────────────────────────────────────

set -euo pipefail

# ── Cấu hình ─────────────────────────────────────────────────
DB_CONTAINER="blog-db"
MC_CONTAINER="blog-memcached"
NETWORK="blog-dev-net"

DB_USER="postgres"
DB_PASSWORD="root"
DB_NAME="blogs"
DB_PORT="5432"
MC_PORT="11211"
MC_MEMORY="256"

# ── Màu ──────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ─────────────────────────────────────────────────────────────

cmd_start() {
  echo ""
  echo "═══════════════════════════════════════"
  echo "  Blog Dev Infra — PostgreSQL + Cache"
  echo "═══════════════════════════════════════"
  echo ""

  # Tạo Docker network nếu chưa có
  if ! docker network inspect "$NETWORK" &>/dev/null; then
    info "Tạo network: $NETWORK"
    docker network create "$NETWORK"
    success "Network đã tạo"
  else
    info "Network '$NETWORK' đã tồn tại, bỏ qua."
  fi

  # ── PostgreSQL ──────────────────────────────────────────────
  if docker ps -a --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
      warn "PostgreSQL '$DB_CONTAINER' đang chạy rồi, bỏ qua."
    else
      info "Khởi động lại container cũ: $DB_CONTAINER"
      docker start "$DB_CONTAINER"
      success "PostgreSQL đã start"
    fi
  else
    info "Tạo và chạy PostgreSQL 16..."
    docker run -d \
      --name "$DB_CONTAINER" \
      --network "$NETWORK" \
      --restart unless-stopped \
      -e POSTGRES_USER="$DB_USER" \
      -e POSTGRES_PASSWORD="$DB_PASSWORD" \
      -e POSTGRES_DB="$DB_NAME" \
      -v blog-postgres-data:/var/lib/postgresql/data \
      -p "${DB_PORT}:5432" \
      postgres:16-alpine
    success "PostgreSQL đã chạy"
  fi

  # ── Memcached ──────────────────────────────────────────────
  if docker ps -a --format '{{.Names}}' | grep -q "^${MC_CONTAINER}$"; then
    if docker ps --format '{{.Names}}' | grep -q "^${MC_CONTAINER}$"; then
      warn "Memcached '$MC_CONTAINER' đang chạy rồi, bỏ qua."
    else
      info "Khởi động lại container cũ: $MC_CONTAINER"
      docker start "$MC_CONTAINER"
      success "Memcached đã start"
    fi
  else
    info "Tạo và chạy Memcached..."
    docker run -d \
      --name "$MC_CONTAINER" \
      --network "$NETWORK" \
      --restart unless-stopped \
      -p "${MC_PORT}:11211" \
      memcached:1.6-alpine \
      memcached -m "$MC_MEMORY"
    success "Memcached đã chạy"
  fi

  echo ""
  cmd_status
  echo ""
  echo "═══════════════════════════════════════"
  echo "  Kết nối Navicat / DBeaver:"
  echo "    Host:     localhost"
  echo "    Port:     ${DB_PORT}"
  echo "    User:     ${DB_USER}"
  echo "    Password: ${DB_PASSWORD}"
  echo "    Database: ${DB_NAME}"
  echo ""
  echo "  Kết nối backend .env:"
  echo "    DB_HOST=127.0.0.1"
  echo "    MEMCACHED_ADDR=127.0.0.1:${MC_PORT}"
  echo "═══════════════════════════════════════"
  echo ""
}

cmd_stop() {
  info "Dừng các containers..."
  docker stop "$DB_CONTAINER" "$MC_CONTAINER" 2>/dev/null && \
    success "Đã dừng $DB_CONTAINER và $MC_CONTAINER" || \
    warn "Một hoặc cả hai container không tồn tại hoặc đã dừng"
}

cmd_restart() {
  cmd_stop
  sleep 1
  cmd_start
}

cmd_status() {
  echo "Trạng thái containers:"
  printf "  %-20s %-12s %s\n" "TÊN" "STATUS" "PORTS"
  echo "  ──────────────────────────────────────────────"

  for NAME in "$DB_CONTAINER" "$MC_CONTAINER"; do
    if docker ps -a --format '{{.Names}}' | grep -q "^${NAME}$"; then
      STATUS=$(docker inspect --format '{{.State.Status}}' "$NAME")
      PORTS=$(docker port "$NAME" 2>/dev/null | tr '\n' ' ' || echo "—")
      if [[ "$STATUS" == "running" ]]; then
        printf "  %-20s ${GREEN}%-12s${NC} %s\n" "$NAME" "$STATUS" "$PORTS"
      else
        printf "  %-20s ${RED}%-12s${NC} %s\n" "$NAME" "$STATUS" "$PORTS"
      fi
    else
      printf "  %-20s ${YELLOW}%-12s${NC}\n" "$NAME" "not found"
    fi
  done
}

cmd_logs() {
  info "Logs realtime (Ctrl+C để thoát)..."
  docker logs -f "$DB_CONTAINER" &
  docker logs -f "$MC_CONTAINER" &
  wait
}

# ── Xử lý tham số dòng lệnh ──────────────────────────────────
case "${1:-start}" in
  start)   cmd_start   ;;
  stop)    cmd_stop    ;;
  restart) cmd_restart ;;
  status)  cmd_status  ;;
  logs)    cmd_logs    ;;
  *)
    echo "Cách dùng: $0 {start|stop|restart|status|logs}"
    exit 1
    ;;
esac
