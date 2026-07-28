#!/usr/bin/env bash

set -euo pipefail
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo ""
echo "════════════════════════════════════════"
echo "  Blog Engine — Production Deploy"
echo "════════════════════════════════════════"
echo ""

# ── Step 1: Kiểm tra Docker ────────────────────────────────
info "Kiểm tra Docker..."
command -v docker &>/dev/null || error "Docker không được cài đặt!"
docker info &>/dev/null      || error "Docker daemon không chạy!"
success "Docker OK"

# ── Step 2: Kiểm tra file .env.docker ─────────────────────
info "Kiểm tra .env.docker..."
[[ -f ".env.docker" ]] || error ".env.docker không tồn tại! Hãy copy và chỉnh sửa từ .env.example"
success ".env.docker OK"

# ── Step 3: Kiểm tra domain đã được đổi chưa ──────────────
info "Kiểm tra domain..."
if grep -q "yourdomain.com" nginx/nginx.conf 2>/dev/null; then
    warn "nginx/nginx.conf vẫn còn 'yourdomain.com' — hãy thay bằng domain thật!"
    warn "Tiếp tục deploy với domain placeholder..."
fi
if grep -q "yourdomain.com" docker-compose.prod.yml 2>/dev/null; then
    warn "docker-compose.prod.yml vẫn còn 'yourdomain.com' — hãy thay bằng domain thật!"
fi

# ── Step 4: Kiểm tra SSL cert (prod) ──────────────────────
info "Kiểm tra SSL certificates..."
if [[ ! -f "nginx/ssl/fullchain.pem" ]] || [[ ! -f "nginx/ssl/privkey.pem" ]]; then
    warn "SSL cert không tìm thấy tại nginx/ssl/"
    warn "  → Để lấy cert miễn phí: certbot certonly --standalone -d yourdomain.com"
    warn "  → Sau đó copy vào:       nginx/ssl/fullchain.pem & nginx/ssl/privkey.pem"
    warn ""
    warn "Bạn có muốn chạy ở chế độ HTTP-only (không SSL) không? [y/N]"
    read -r answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        warn "Chạy chế độ HTTP-only — không nên dùng trên production thật!"
        USE_HTTP_ONLY=true
    else
        error "Dừng deploy. Hãy cài SSL cert trước."
    fi
fi
USE_HTTP_ONLY="${USE_HTTP_ONLY:-false}"

# ── Step 5: Tạo thư mục ssl nếu chưa có ──────────────────
mkdir -p nginx/ssl

# ── Step 6: Pull/Build images ─────────────────────────────
info "Build Docker images (lần đầu có thể mất vài phút)..."
docker compose \
    -f docker-compose.yml \
    --env-file .env.docker \
    build --parallel
success "Build xong!"

# ── Step 7: Khởi động stack ───────────────────────────────
info "Khởi động toàn bộ stack..."
docker compose \
    -f docker-compose.yml \
    --env-file .env.docker \
    up -d --remove-orphans
success "Stack đã khởi động!"

# ── Step 8: Đợi và kiểm tra health ───────────────────────
info "Đợi services healthy (tối đa 60s)..."
sleep 5

MAX_WAIT=60
ELAPSED=0
while [[ $ELAPSED -lt $MAX_WAIT ]]; do
    STATUS=$(docker compose \
        -f docker-compose.yml \
        --env-file .env.docker \
        ps --format json 2>/dev/null | python3 -c "
import sys, json
lines = sys.stdin.readlines()
unhealthy = []
for line in lines:
    try:
        s = json.loads(line)
        name = s.get('Name','')
        health = s.get('Health','')
        state = s.get('State','')
        if state == 'running' and health == 'unhealthy':
            unhealthy.append(name)
    except: pass
print(','.join(unhealthy))
" 2>/dev/null || echo "")

    if [[ -z "$STATUS" ]]; then
        success "Tất cả services healthy!"
        break
    fi
    warn "Services chưa healthy: $STATUS — đợi thêm..."
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

# ── Step 9: In trạng thái ─────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo "  Trạng thái Services"
echo "════════════════════════════════════════"
docker compose \
    -f docker-compose.yml \
    --env-file .env.docker \
    ps

echo ""
echo "════════════════════════════════════════"
success "Deploy hoàn tất!"
echo ""
echo "  🌐 Website:  https://yourdomain.com"
echo "  📡 API:      https://yourdomain.com/api"
echo "  📋 Logs:     docker compose -f docker-compose.yml  logs -f"
echo "  🛑 Dừng:     docker compose -f docker-compose.yml  down"
echo "════════════════════════════════════════"
echo ""
