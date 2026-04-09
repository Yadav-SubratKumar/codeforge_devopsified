# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: Chainguard Nginx ────────────────────────────────────────────────
FROM cgr.dev/chainguard/nginx:latest

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080