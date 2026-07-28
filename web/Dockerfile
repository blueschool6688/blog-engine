# ═══════════════════════════════════════════════════════════════
# Web Dockerfile — React Router v7 SSR (Node 22)
# Multi-stage: deps → build → minimal production runtime
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Install dependencies ────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# ── Stage 2: Build SSR bundle ────────────────────────────────
FROM deps AS builder
WORKDIR /app

# Build-time env vars — baked into the client JS bundle
ARG VITE_API_BASE_URL=http://api:8080/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy source and build
COPY . .
RUN pnpm run build

# ── Stage 3: Production runtime ─────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Copy only production dependencies + build output
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts --prod

COPY --from=builder /app/build ./build

EXPOSE 3000

# Start the React Router SSR server via @react-router/serve
CMD ["pnpm", "exec", "react-router-serve", "./build/server/index.js"]