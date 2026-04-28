# 🔧 CodeForge — Multi-Tier Coding Platform

A production-ready, 4-tier coding platform built with React, Node.js/Express, PostgreSQL, and Redis — designed as a DevSecOps project foundation.
---
## 📁 Diagram
![Alt Text](d.png)   
---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CODEFORGE PLATFORM                       │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   TIER 1     │   TIER 2     │   TIER 3     │    TIER 4      │
│  Frontend    │  Backend API │  PostgreSQL  │    Redis       │
│  React +     │  Node.js +   │  Database    │    Cache +     │
│  Monaco +    │  Express     │              │    Job Queue   │
│  Nginx       │              │              │                │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                    Code Execution Worker                     │
│              (Redis Queue Consumer — Node.js)                │
└─────────────────────────────────────────────────────────────┘
```

### Services
| Service    | Tech                  | Port | Purpose                         |
|------------|-----------------------|------|---------------------------------|
| frontend   | React + Nginx         | 3000 | UI, Monaco editor, routing      |
| backend    | Node.js + Express     | 5000 | REST API, auth, business logic  |
| postgres   | PostgreSQL 15         | 5432 | Users, challenges, submissions  |
| redis      | Redis 7               | 6379 | Session cache, job queue        |
| worker     | Node.js               | —    | Async code evaluation           |

---

## 📁 Project Structure

```
codeforge/
├── docker-compose.yml          # Orchestrates all 4 tiers
│
├── frontend/                   # TIER 1 — React App
│   ├── src/
│   │   ├── App.js              # Router + Auth wrapper
│   │   ├── api.js              # Axios client with JWT interceptors
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   └── pages/
│   │       ├── Home.js
│   │       ├── Challenges.js
│   │       ├── Editor.js       # Monaco editor + submission polling
│   │       ├── Login.js
│   │       ├── Register.js
│   │       └── Leaderboard.js
│   ├── Dockerfile              # Multi-stage: build → Nginx serve
|   ├── .env.example                # Environment variable template
│   └── nginx.conf              # Reverse proxy + security headers
│
├── backend/                    # TIER 2 — Express API
│   ├── server.js               # App bootstrap, middleware, routes
│   ├── routes/
│   │   ├── auth.js             # Register, login, logout, /me
│   │   ├── challenges.js       # List + detail with Redis caching
│   │   ├── submissions.js      # Submit code, poll results
│   │   ├── users.js            # Leaderboard, profiles
│   │   └── health.js           # Health check endpoint
│   ├── middleware/
│   │   └── auth.js             # JWT verify + Redis blacklist
│   ├── config/
│   │   ├── db.js               # PostgreSQL pool
│   │   ├── redis.js            # Redis client + cache helpers
│   │   ├── logger.js           # Winston structured logging
│   │   └── init.sql            # DB schema + seed data
│   ├── package.json
│   └── Dockerfile              # Multi-stage
│
└── worker/                     # Code Execution Worker
    ├── worker.js               # Redis BRPOP queue consumer
    ├── package.json
    └── Dockerfile
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev)

### Run with Docker (Recommended)

```bash
# 1. Clone and enter the project
cd codeforge

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker compose up --build

# 4. Open the app
open http://localhost:3000
```

### Run Locally (Dev Mode)

```bash
# Start infrastructure
docker compose up postgres redis -d

# Backend
cd backend
cp ../.env.example .env
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start

# Worker (new terminal)
cd worker
npm install
npm start
```
---

#### CI/CD (GitHub Actions)
```
.github/
└── workflows/
    ├── ci_security.yml  
    # (Build + test + SAST + build & scan image, push to registry + dependency scan on every PR & Push)

```
