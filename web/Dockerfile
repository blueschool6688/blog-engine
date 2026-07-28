FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts

FROM node:22-alpine AS dev_runtime
WORKDIR /app

# Khởi tạo pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy cấu hình package
COPY package.json pnpm-lock.yaml ./

# Cài đặt dependency
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Copy toàn bộ code
COPY . .

ENV NODE_ENV=development
ENV VITE_API_URL=http://api:8080
ENV VITE_PUBLIC_API_URL=http://localhost:8080

EXPOSE 3000

# Chạy trực tiếp dev server của Vite
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "3000"]