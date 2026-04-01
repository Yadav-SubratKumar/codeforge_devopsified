# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: Distroless Node ─────────────────────────────────────────────────
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app
COPY --from=builder /app/build ./build

EXPOSE 5000

CMD ["build/server.js"]