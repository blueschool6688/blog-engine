# ╔══════════════════════════════════════════════════════════════╗
# ║  Blog Engine — Frontend Dockerfile                           ║
# ║  React Router v7 with SSR (Server-Side Rendering)            ║
# ║  Runtime: node:22-alpine, serves on :3000                    ║
# ╚══════════════════════════════════════════════════════════════╝

# ── Stage 1: Install dependencies (pnpm for speed) ───────────────
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build production bundle ─────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# VITE_API_URL       = URL used by Node SSR server (server-to-server, Docker network)
# VITE_PUBLIC_API_URL = URL used by browser client (exposed to internet)
ARG VITE_API_URL=http://api:8080
ARG VITE_PUBLIC_API_URL=http://localhost:8080

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Produces: ./build/server/index.js  (SSR entry)
#           ./build/client/          (static assets)
RUN pnpm run build

# ── Stage 3: Minimal SSR runtime ─────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/build        ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "./build/server/index.js"]
