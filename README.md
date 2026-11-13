# EchoRoom — Anonymous Thoughts & Empathy Platform

> A place to express yourself without needing to reveal who you are.

EchoRoom is an anonymous social web platform built on the MERN stack where people can express genuine emotions, share unvarnished thoughts, and interact with strangers through supportive conversations and real-time discussion rooms.

---

## Key Features

- **Anonymous Identity Protection**: Separate private user authentication (email/password) from public pseudonymity.
- **Emotion Categorization**: 8 distinct emotional categories (Happy, Sad, Confused, Frustrated, Hopeful, Lonely, Grateful, Motivated).
- **Empathy Reactions**: 5 validated empathy responses instead of vanity "likes".
- **Real-Time Discussion Rooms**: Ephemeral peer-to-peer discussion rooms powered by Socket.IO.
- **Thought Expiration**: Flexible retention (24h, 3 days, 7 days, or never) with MongoDB TTL and real-time query filtering.
- **Community Insights**: Visual aggregations of community emotional temperature and trending discussion themes.
- **Moderation & Safety**: Reporting mechanisms and administrative moderation tools to maintain psychological safety.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router DOM v7, Axios, Lucide React, Recharts, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO, MongoDB Atlas / Mongoose, JWT, bcrypt, Helmet, CORS
- **Testing**: Supertest (backend integration), Vitest (frontend)

---

## Project Structure

```
Echoroom/
├── backend/               # Express.js REST API & Socket.IO server
│   ├── server.js          # Server entry point
│   ├── src/
│   │   ├── config/        # Database & environment configurations
│   │   ├── models/        # 9 Mongoose data schemas
│   │   ├── routes/        # Express REST API routes
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, validation, error handling
│   │   └── socket/        # Real-time event handlers
│   └── package.json
├── frontend/              # React + Vite client
│   ├── src/
│   │   ├── components/    # Reusable UI components & layouts
│   │   ├── pages/         # 13 application views
│   │   ├── context/       # Auth & Realtime Context
│   │   ├── api/           # Axios API services
│   │   └── App.jsx
│   ├── index.html
│   └── tailwind.config.js
├── docs/                  # Architecture, decisions, and progress tracking
│   ├── PROJECT_STATUS.md  # 10-step roadmap progress
│   └── DECISIONS.md       # Technical trade-offs log
└── README.md
```

---

## Quickstart

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5000`.

