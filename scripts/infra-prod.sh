#!/usr/bin/env bash
# ==============================================================================
# Blog Engine — Production Infra (Database & Cache)
# Không mở port public, đọc biến môi trường từ .env.docker
# ==============================================================================

# Load variables from .env.docker if it exists
if [ -f .env.docker ]; then
  export $(grep -v '^#' .env.docker | xargs)
else
  echo -e "\033[0;31m[ERROR]\033[0m Không tìm thấy file .env.docker! Hãy copy từ .env.docker.example và cấu hình."
  exit 1
fi

DB_CONTAINER="blog-db"
MC_CONTAINER="blog-memcached"
NETWORK="${DOCKER_NETWORK:-blogs_backend_net}"

# Fallback values if not specified in .env.docker
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-root}"
DB_NAME="${DB_NAME:-blogs}"
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
  echo "  Blog Prod Infra — PostgreSQL + Cache"
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
    info "Tạo và chạy PostgreSQL 16 (Production Mode)..."
    docker run -d \
      --name "$DB_CONTAINER" \
      --network "$NETWORK" \
      --restart always \
      -e POSTGRES_USER="$DB_USER" \
      -e POSTGRES_PASSWORD="$DB_PASSWORD" \
      -e POSTGRES_DB="$DB_NAME" \
      -v blog-postgres-data-prod:/var/lib/postgresql/data \
      postgres:16-alpine
    success "PostgreSQL đã chạy (Không public port)"
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
    info "Tạo và chạy Memcached (Production Mode)..."
    docker run -d \
      --name "$MC_CONTAINER" \
      --network "$NETWORK" \
      --restart always \
      memcached:1.6-alpine \
      memcached -m "$MC_MEMORY"
    success "Memcached đã chạy (Không public port)"
  fi

  echo ""
  cmd_status
  echo ""
  echo "═══════════════════════════════════════"
  echo "  Hệ thống Infra (Prod) đã sẵn sàng!"
  echo "  Để kết nối từ backend, hãy chắc chắn"
  echo "  .env.docker có chứa:"
  echo "    DB_HOST=$DB_CONTAINER"
  echo "    MEMCACHED_ADDR=$MC_CONTAINER:11211"
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
