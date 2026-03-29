# 🔧 CodeForge — Multi-Tier Coding Platform

A production-ready, 4-tier coding platform built with React, Node.js/Express, PostgreSQL, and Redis — designed as a DevSecOps project foundation.

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
├── .env.example                # Environment variable template
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
│   └── Dockerfile              # Multi-stage, non-root user
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

## 🔐 Security Features (Built-in)

| Feature | Implementation |
|---------|----------------|
| Password hashing | bcryptjs with cost factor 12 |
| JWT authentication | Signed tokens, 7-day expiry |
| Token revocation | Redis blacklist on logout |
| Rate limiting | Global (100/15min) + Auth (10/15min) + Submit (5/min) |
| Input validation | express-validator on all routes |
| Security headers | Helmet.js (CSP, HSTS, X-Frame, etc.) |
| CORS restriction | Configurable allowed origins |
| Non-root containers | Dedicated appuser in all Dockerfiles |
| Request size limits | 10kb body limit |
| Code length cap | 50,000 char max on submissions |

---

## 🛡️ DevSecOps Integration Points

This project is structured to make it easy to layer a DevSecOps pipeline on top.

### Suggested Pipeline Stages

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   SCM    │──▶│  SAST    │──▶│  Build   │──▶│  DAST    │──▶│  Deploy  │
│  Push    │   │ Scan     │   │  Docker  │   │  Scan    │   │          │
│  (Git)   │   │          │   │  Image   │   │          │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### Where to Add Tools

#### SAST (Static Analysis)
- **Semgrep** — Add `.semgrep.yml` rules for Express/Node patterns
- **SonarQube** — Point at `backend/` and `frontend/src/`
- **ESLint Security Plugin** — Add `eslint-plugin-security` to both packages

#### Dependency Scanning
- **OWASP Dependency-Check** — Scan `package.json` files
- **npm audit** — Already works: `npm audit --audit-level=high`
- **Snyk** — `snyk test` in both `frontend/` and `backend/`

#### Container Scanning
- **Trivy** — `trivy image codeforge-backend:latest`
- **Grype** — `grype codeforge-frontend:latest`
- **Docker Scout** — `docker scout cves codeforge-backend`

#### Secret Detection
- **GitLeaks** — `gitleaks detect --source .`
- **TruffleHog** — Scan git history for leaked secrets
- **detect-secrets** — Pre-commit hook integration

#### DAST (Dynamic Analysis)
- **OWASP ZAP** — Point at `http://localhost:3000` after boot
- **Nuclei** — Run templates against the running API

#### CI/CD (GitHub Actions)
```
.github/
└── workflows/
    ├── ci.yml          # Build + test on every PR
    ├── security.yml    # SAST + dependency scan on push
    └── release.yml     # Build, scan image, push to registry
```

### Key Endpoints to Test
```
POST /api/auth/register   — Auth bypass, input injection
POST /api/auth/login      — Brute force protection
POST /api/submissions     — Code injection, rate limiting
GET  /api/health          — Information disclosure
```

---

## 📡 API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| POST | `/api/auth/logout` | ✅ | Revoke token |
| GET  | `/api/auth/me` | ✅ | Current user info |

### Challenges
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/challenges` | ❌ | List challenges (filter by difficulty/category) |
| GET | `/api/challenges/:slug` | ❌ | Challenge detail + template |

### Submissions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/submissions` | ✅ | Submit code for evaluation |
| GET  | `/api/submissions/:id` | ✅ | Poll submission result |
| GET  | `/api/submissions` | ✅ | User's submission history |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/leaderboard` | ❌ | Top 50 users by points |
| GET | `/api/users/:username/profile` | ❌ | Public user profile |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Checks DB + Redis connectivity |

---

## 🔄 Submission Flow

```
User submits code
      │
      ▼
POST /api/submissions
  └─ Validates input (lang whitelist, size limit, auth)
  └─ Inserts row (status: pending)
  └─ Pushes job to Redis queue
  └─ Returns submissionId
      │
      ▼
Worker (BRPOP from Redis)
  └─ Updates status → running
  └─ Runs in sandbox (TODO: real execution engine)
  └─ Updates status → accepted | wrong_answer | ...
  └─ Awards points if first accepted
      │
      ▼
Frontend polls GET /api/submissions/:id
  └─ Displays result when status changes
```

---

## 🧪 Testing

```bash
# Backend unit/integration tests
cd backend && npm test

# Manual API test (curl)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"Password1"}'
```

---

## 🛠️ Extending the Project

- **Real code execution** — Replace the mock in `worker/worker.js` with [Piston API](https://github.com/engineer-man/piston) or [Judge0](https://github.com/judge0/judge0)
- **Add more challenges** — Insert rows into the `challenges` table via SQL
- **Admin panel** — Routes protected by `requireAdmin` middleware are ready
- **WebSocket results** — Replace polling with Socket.io for real-time feedback
- **OAuth** — Add GitHub/Google login via Passport.js
