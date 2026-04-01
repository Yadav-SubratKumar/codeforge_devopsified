FROM cgr.dev/chainguard/node:latest

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

CMD ["worker.js"]