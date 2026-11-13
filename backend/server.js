const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const { connectDB } = require('./src/config/db');
const { getJwtSecret } = require('./src/config/jwt');

// Enforce mandatory security configuration on startup
try {
  getJwtSecret();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure trusted CORS origins (strict matching, no open fallbacks)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};

// Initialize Socket.IO with consistent CORS validation
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS rejected: Origin not allowed'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Attach Socket.IO instance to app for route access
app.set('io', io);

// Initialize real-time room communication
const { initRoomSocket } = require('./src/socket/roomSocket');
initRoomSocket(io);

// Security & Utility Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS rejected: Origin not allowed'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    service: 'EchoRoom API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStates[dbState] || 'unknown',
      readyState: dbState,
    },
  });
});

const apiRoutes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorMiddleware');
const { apiLimiter } = require('./src/middleware/rateLimiter');

// Mount API Routes with General Rate Limiting
app.use('/api', apiLimiter, apiRoutes);

// Centralized 404 Handler for undefined API routes
app.use('/api', notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Server Startup Function
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP & WebSocket Server
  if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
      console.log(`[Server] EchoRoom API is listening on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, server, io, startServer };
