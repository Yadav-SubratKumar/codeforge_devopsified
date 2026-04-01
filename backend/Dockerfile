# ─── Stage 1: Builder ───────────────────────────────────────────────────────
FROM node:24-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# ─── Stage 2: Chainguard Runtime ────────────────────────────────────────────
FROM cgr.dev/chainguard/node:latest

WORKDIR /app

COPY --from=builder /app /app

ENV NODE_ENV=production

EXPOSE 5000

CMD ["server.js"]