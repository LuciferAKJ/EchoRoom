# EchoRoom — Anonymous Thoughts & Empathy Platform

> *A sanctuary to share what weighs upon you without the burden of identity.*

EchoRoom is a full-stack, university-grade web application built on the **MERN stack (MongoDB, Express, React 19, Node.js) with Socket.IO**. It enables individuals to share authentic emotions, discover relatable perspectives, exchange supportive empathy reactions, and enter live ephemeral discussion rooms without revealing real-world identities.

---

## System Architecture

```
                    ┌───────────────────────────────────────────┐
                    │            EchoRoom Frontend              │
                    │   React 19 • Vite • Tailwind • Recharts   │
                    └─────────────────────┬─────────────────────┘
                                          │
                        HTTP REST / JSON  │  WebSocket (Socket.IO)
                                          │
                    ┌─────────────────────▼─────────────────────┐
                    │             Express API Gateway           │
                    │   Helmet • Strict CORS • Rate-Limiting    │
                    └───────────┬───────────────────┬───────────┘
                                │                   │
                    ┌───────────▼──────────┐   ┌────▼───────────┐
                    │   REST Controllers   │   │  Socket.IO Hub │
                    │ Auth • Feed • Empathy│   │ Presence • Chat│
                    └───────────┬──────────┘   └────┬───────────┘
                                │                   │
                    ┌───────────▼───────────────────▼───────────┐
                    │               Mongoose ODM                │
                    │    9 Relational Schemas • Compound Unique │
                    │       Indexes • Dual-Layer Expiration     │
                    └─────────────────────┬─────────────────────┘
                                          │
                    ┌─────────────────────▼─────────────────────┐
                    │      MongoDB Atlas (echoroom / test)      │
                    └───────────────────────────────────────────┘
```

---

## Key Features & Security Guarantees

1. **Strict Anonymity Partitioning:** Private credentials (`email`, `passwordHash`) are never exposed publicly or sent to WebSocket channels. All public feeds and interactions exclusively present generated personas (e.g. `QuietEcho#4021`, custom avatar color, traits).
2. **Curated Emotional Taxonomy:** 8 structured emotional categories: *Happy, Sad, Confused, Frustrated, Hopeful, Lonely, Grateful, Motivated*.
3. **Genuine Empathy Reactions:** Replaced vanity metrics with 5 thoughtful empathetic responses: *I understand, You're not alone, Sending support, Relate, Thank you*. Compound unique indexes ensure one reaction type per user while allowing reaction toggles.
4. **Real-Time Ephemeral Discussion Rooms:** Live peer-to-peer discussion channels using authenticated Socket.IO connections with room presence enforcement, live participant counts, and anti-spam message throttling (600ms).
5. **Dual-Layer Expiration Lifecycle:** Authors can choose a lifespan (*24 hours, 3 days, 7 days, or permanent*). Expired thoughts are filtered immediately at query-level and purged in the background by MongoDB TTL indexes.
6. **Community Insights Analytics:** Real-time emotional climate, trending topics, 7-day thought activity timeline, and active room counts powered by MongoDB aggregation pipelines.
7. **Proactive Moderation & Safety:** In-app reporting workflows, content safety heuristics, and an administrator queue (`/admin`) for triaging flags and restricting abusive accounts.
8. **Security Hardening:** Centralized secret management enforcing `JWT_SECRET` presence at startup, strict whitelist CORS origin matching (Express & Socket.IO), authenticated access for discussion room history (`GET /api/rooms/:id`), and automated test isolation to `echoroom_test`.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router DOM v7, Axios, Lucide React, Recharts, Socket.IO Client |
| **Backend** | Node.js (v18+ / v20+), Express.js, Socket.IO, Mongoose, JWT, bcrypt, Helmet, CORS, Express Rate Limit |
| **Database** | MongoDB Atlas (Cloud Cluster with Replica Set, TTL Indexes & Compound Constraints) |
| **Testing** | Node.js Native Test Runner (`node --test`), Supertest, Vitest, Testing Library, Socket.IO Client Test Harness |
| **Build & Tooling** | Vite, ESLint (Flat Config, 0 errors), PostCSS, Tailwind CSS |
| **Deployment Targets** | Vercel (Frontend SPA with client rewrites), Render / Railway (Backend Node.js & WebSockets) |

---

## Project Structure

```
Echoroom/
├── backend/                         # Express.js REST API & Socket.IO server
│   ├── server.js                    # Server bootstrap, CORS validation & socket initialization
│   ├── src/
│   │   ├── config/                  # DB connection, DNS resolver fallback, JWT secret manager
│   │   ├── models/                  # 9 Mongoose schemas with compound indexes
│   │   ├── routes/                  # Express REST route controllers
│   │   ├── controllers/             # Core business logic & aggregation pipelines
│   │   ├── middleware/              # JWT auth (protect, optionalAuth), RBAC, validation, rate limiting
│   │   ├── socket/                  # Real-time room presence & chat event handlers
│   │   └── utils/                   # Persona generator & content filter heuristics
│   ├── tests/                       # Automated integration & socket tests
│   │   ├── api.test.js              # 25 Supertest API integration tests (isolated to echoroom_test)
│   │   └── socketTest.js            # Multi-client authenticated Socket.IO test suite
│   ├── .env.example                 # Backend environment variable template
│   └── package.json
├── frontend/                        # React 19 + Vite single page application
│   ├── src/
│   │   ├── api/                     # Axios client with JWT interceptor
│   │   ├── components/              # Layouts, Sidebar, UI library (Button, Card, Input)
│   │   ├── context/                 # AuthContext & SocketContext
│   │   ├── pages/                   # 13 complete application views
│   │   ├── utils/                   # Emotion styling, badge colors & formatting helpers
│   │   └── test/                    # Frontend unit test suites (9 passing tests)
│   ├── index.html                   # HTML entrypoint with metadata & custom favicon
│   ├── vercel.json                  # Production SPA rewrite configuration
│   ├── .env.example                 # Frontend environment variable template
│   └── package.json
├── docs/                            # Core engineering documentation
│   ├── API_DOCUMENTATION.md         # Full REST API & WebSocket specifications
│   ├── DATABASE_DOCUMENTATION.md    # 9 Mongoose schemas, compound indexes, and privacy boundaries
│   ├── TESTING_GUIDE.md             # Automated test matrix & 20-step manual testing runbook
│   ├── DEPLOYMENT_GUIDE.md          # Step-by-step production deployment instructions
│   └── FINAL_SUBMISSION_CHECKLIST.md# Audit verification, test counts, and submission record
├── render.yaml                      # Render cloud deployment blueprint
└── README.md
```

---

## Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18 or higher (v20+ recommended).
- **MongoDB Atlas Cluster** (or local MongoDB Community Server):
  - Ensure your IP is whitelisted (or `0.0.0.0/0` under Network Access during evaluation).
- **Git**

### 2. Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy template:
cp .env.example .env
# On Windows PowerShell: Copy-Item .env.example .env
```

Edit `backend/.env` with your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/echoroom?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_secure_random_64_character_hex_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> **Note on Windows DNS:** `backend/src/config/db.js` includes automated DNS resolver fallbacks (Google `8.8.8.8` and Cloudflare `1.1.1.1`) so `mongodb+srv://` connection strings resolve reliably without Windows SRV lookup timeouts.

Start the backend:
```bash
npm run dev
# Server starts on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 3. Frontend Setup
In a new terminal window:
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# On Windows PowerShell: Copy-Item .env.example .env
```

Verify `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
# Client starts on http://localhost:5173
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## Running Automated Tests & Quality Checks

### Backend Automated Test Suite
```bash
cd backend
npm test
```
- **Executes:** `node --test tests/api.test.js && node tests/socketTest.js`
- **Result:** **25 passing API tests across 6 suites + multi-client Socket.IO test suite**
- **Safety Guarantee:** Automatically routes all test operations to `echoroom_test` to keep development and production collections completely untouched.

### Frontend Automated Unit Tests
```bash
cd frontend
npm test
```
- **Executes:** `node --test src/test/**/*.test.js`
- **Result:** **9 passing tests** (emotion taxonomy badge mapping, auth storage token serialization, query filter string building).
- *(Optional Vitest command for Node LTS: `npm run test:vitest`)*

### Code Quality & Production Build
```bash
cd frontend

# Run ESLint (Flat Config)
npm run lint
# Output: 0 errors

# Run Vite Production Build
npm run build
# Output: Successfully built dist/ with 0 compilation errors
```

---

## Troubleshooting Common Issues

1. **`EADDRINUSE: address already in use :::5000`**
   - A background process is occupying port 5000.
   - On Windows PowerShell:
     ```powershell
     Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
     ```
   - On macOS/Linux:
     ```bash
     kill -9 $(lsof -t -i:5000)
     ```

2. **MongoDB `querySrv ECONNREFUSED` on Windows**
   - Caused by local ISP or Windows router DNS failing SRV record queries.
   - Fixed automatically in EchoRoom via Google/Cloudflare DNS fallbacks in `backend/src/config/db.js`. Ensure your machine has active internet access.

3. **CORS Rejection in Browser Console**
   - The backend enforces strict origin whitelisting.
   - Ensure `CLIENT_URL` in `backend/.env` matches your browser URL (e.g., `http://localhost:5173`).

---

## Core Documentation Index

| Document | Purpose |
|---|---|
| [**API Documentation**](./docs/API_DOCUMENTATION.md) | REST API endpoints, query params, payloads, status codes & Socket.IO events |
| [**Database Documentation**](./docs/DATABASE_DOCUMENTATION.md) | 9 Mongoose models, compound indexes, TTL rules & privacy boundary definitions |
| [**Testing Guide**](./docs/TESTING_GUIDE.md) | Test breakdown matrix, execution guide & 20-step manual evaluation runbook |
| [**Deployment Guide**](./docs/DEPLOYMENT_GUIDE.md) | Step-by-step production hosting on Vercel, Render, and MongoDB Atlas |
| [**Final Submission Checklist**](./docs/FINAL_SUBMISSION_CHECKLIST.md) | Formal audit checklist, test metrics, security remediations & submission notes |
