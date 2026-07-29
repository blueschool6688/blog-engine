# ═══════════════════════════════════════════════════════════════
# Web Dockerfile — React Router v7 SSR (Node 22)
# Multi-stage: deps → build → minimal production runtime
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Install ALL dependencies (including devDeps for build) ──
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── Stage 2: Build ───────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY . .
RUN pnpm run build

# ── Stage 3: Install production-only deps for slim runtime ───────
FROM node:22-alpine AS prod-deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts --prod

# ── Stage 4: Minimal runtime image ───────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Copy production node_modules (no devDeps — smaller image)
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json

# Copy compiled build output from builder stage
COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["pnpm", "exec", "react-router-serve", "./build/server/index.js"]