FROM node:24-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .

# Runtime
FROM gcr.io/distroless/nodejs22-debian13

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./

ENV NODE_ENV=production

EXPOSE 5000
CMD ["server.js"]