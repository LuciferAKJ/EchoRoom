# EchoRoom — Anonymous Thoughts & Empathy Platform

> *A sanctuary to share what weighs upon you without the burden of identity.*

EchoRoom is a full-stack, university-grade web application built on the **MERN stack (MongoDB, Express, React, Node.js) with Socket.IO**. It enables individuals to share authentic emotions, discover relatable perspectives, exchange supportive empathy reactions, and enter live ephemeral discussion rooms without revealing real-world identities.

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
                    │   Helmet • CORS • Rate-Limiting • JWT     │
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
                    │           MongoDB Atlas Cluster           │
                    └───────────────────────────────────────────┘
```

---

## Key Features

1. **Strict Anonymity Partitioning:** Private credentials (`email`, `passwordHash`) are never exposed publicly or sent to sockets. All public feeds and interactions exclusively present generated personas (e.g. `QuietEcho#4021`, custom avatar color, bio).
2. **Emotional Taxonomy:** 8 curated emotional states: *Happy, Sad, Confused, Frustrated, Hopeful, Lonely, Grateful, Motivated*.
3. **Genuine Empathy Reactions:** Replaced hollow vanity "likes" with 5 empathetic responses: *I understand, You're not alone, Sending support, Relate, Thank you*.
4. **Real-Time Discussion Rooms:** Live peer-to-peer audio-less conversation channels using Socket.IO with real-time presence indicators and anti-spam message throttling (600ms).
5. **Dual-Layer Expiration Lifecycle:** Authors can choose a lifespan (*24 hours, 3 days, 7 days, or permanent*). Expired thoughts are immediately filtered out by query logic and purged automatically by MongoDB TTL background indexes.
6. **Community Insights Analytics:** Real-time aggregated emotional climate, trending topics, 7-day volume trends, and active room counts powered by MongoDB aggregation pipelines.
7. **Proactive Moderation & Safety:** In-app reporting workflows, content safety heuristics, and administrator queue for triaging flags and restricting abusive users.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router DOM v7, Axios, Lucide React, Recharts, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose, JWT, bcrypt, Helmet, CORS, Express Rate Limit |
| **Database** | MongoDB Atlas (Cloud Cluster with Replica Set & TTL Indexes) |
| **Testing** | Node.js Test Runner, Supertest, Vitest, Testing Library, Socket.IO Client Test Harness |
| **Deployment** | Vercel (Frontend SPA), Render / Railway (Backend Node.js & WebSockets) |

---

## Project Structure

```
Echoroom/
├── backend/                         # Express.js REST API & Socket.IO server
│   ├── server.js                    # Server bootstrap & socket initialization
│   ├── src/
│   │   ├── config/                  # Database connectivity & DNS fallback
│   │   ├── models/                  # 9 Mongoose schemas with compound indexes
│   │   ├── routes/                  # Express REST route controllers
│   │   ├── controllers/             # Core business logic & aggregations
│   │   ├── middleware/              # JWT auth, RBAC, validation, rate limiting
│   │   ├── socket/                  # Real-time room event handlers
│   │   └── utils/                   # Identity generator & content filter
│   ├── tests/                       # Automated integration & socket tests
│   │   ├── api.test.js              # 20 Supertest API integration tests
│   │   └── socketTest.js            # Multi-client Socket.IO real-time suite
│   ├── .env.example                 # Backend environment variable template
│   └── package.json
├── frontend/                        # React + Vite single page application
│   ├── src/
│   │   ├── api/                     # Axios client with JWT interceptor
│   │   ├── components/              # Layouts, Sidebar, UI library (Button, Card, Input)
│   │   ├── context/                 # AuthContext & SocketContext
│   │   ├── pages/                   # 13 complete application views
│   │   ├── utils/                   # Emotion styling & formatting helpers
│   │   └── test/                    # Frontend unit test suites
│   ├── vercel.json                  # Production SPA rewrite configuration
│   ├── .env.example                 # Frontend environment variable template
│   └── package.json
├── docs/                            # Engineering documentation
│   ├── PROJECT_STATUS.md            # 10-step roadmap tracker
│   ├── DECISIONS.md                 # Technical design log & trade-offs
│   ├── API_DOCUMENTATION.md         # Full REST API & WebSocket specifications
│   ├── DATABASE_DOCUMENTATION.md    # 9 Mongoose schemas, indexes, and privacy boundaries
│   └── DEPLOYMENT_GUIDE.md          # Step-by-step production deployment instructions
├── render.yaml                      # Render cloud deployment blueprint
└── README.md
```

---

## Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher; v20+ recommended)
- MongoDB Atlas cluster or local MongoDB instance

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string and JWT secret

# Run development server
npm run dev
# Server will start on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env

# Run Vite dev server
npm run dev
# Client will start on http://localhost:5173
```

---

## Running the Automated Test Suites

### Backend Tests (20 API Tests + Multi-Client Real-Time Socket Tests)
```bash
cd backend
npm test
```
*Executes:*
1. `tests/api.test.js`: Verifies health check, user registration, login, duplicate account rejections, thought creation with emotion validation, feed pagination, empathy reaction toggles, comments, bookmarks, analytics, and content reporting.
2. `tests/socketTest.js`: Spawns two concurrent authenticated socket clients to verify real-time room joining, participant counting, live message broadcasting, and room closure signals.

### Frontend Tests (Unit & Component Logic)
```bash
cd frontend
npm test
```
*Executes:*
Verifies emotion taxonomy badges, timestamp calculations, auth token storage, feed query filter builders, and pagination bounds.

---

## Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.mongodb.net/echoroom` |
| `JWT_SECRET` | Secret key for JWT signing | `super_secure_random_production_secret` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` or `https://echoroom.vercel.app` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL for REST API | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Base URL for WebSocket connection | `http://localhost:5000` |

---

## Deployment & Production
- **Frontend:** Hosted on [Vercel](https://vercel.com) with client-side SPA routing (`vercel.json`).
- **Backend:** Hosted on [Render](https://render.com) or [Railway](https://railway.app) with persistent WebSockets enabled.
- For complete step-by-step instructions, see [`docs/DEPLOYMENT_GUIDE.md`](./docs/DEPLOYMENT_GUIDE.md).

---

## Documentation Links
- [REST API & WebSocket Documentation](./docs/API_DOCUMENTATION.md)
- [Database Architecture & Mongoose Schemas](./docs/DATABASE_DOCUMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Project Progress & Verification Log](./docs/PROJECT_STATUS.md)
- [Architectural Decisions Log](./docs/DECISIONS.md)
