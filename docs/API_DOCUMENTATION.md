# EchoRoom REST API & Real-Time WebSocket Documentation

Welcome to the comprehensive API documentation for **EchoRoom – Anonymous Thoughts & Empathy Platform**.

The EchoRoom backend is built with **Node.js, Express, MongoDB (Mongoose), and Socket.IO**. It exposes a secure, anonymous REST interface coupled with bi-directional WebSocket rooms for live peer-to-peer empathy.

---

## Base URLs
- **Local Development API:** `http://localhost:5000/api`
- **Local WebSocket Gateway:** `ws://localhost:5000`
- **Production API:** `https://your-service.onrender.com/api`

---

## Authentication & Security Model
EchoRoom separates **Account Authentication** from **Public Persona Display**:
- **JWT Authentication:** Pass the issued token in the HTTP Authorization header:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Socket Handshake:** Pass the token in the socket connection handshake:
  ```javascript
  io('http://localhost:5000', {
    auth: { token: 'Bearer <your_jwt_token>' }
  });
  ```
- **Anonymity Guarantee:** The `email` and `passwordHash` fields are strictly restricted to authentication and account management. All public feeds, thoughts, reactions, and chat messages strictly display the generated `AnonymousIdentity` (`pseudonym`, `avatarColor`, `bio`).

---

## Standard Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "message": "Optional descriptive status message",
  "data": { ... },
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Error Envelope
```json
{
  "status": "fail", // or "error"
  "message": "Human-readable explanation of error"
}
```

---

## 1. Authentication & Anonymous Identity (`/api/auth`, `/api/identity`)

### `POST /api/auth/register`
Creates a private user account and automatically provisions a random anonymous identity.
- **Rate Limit:** 100 requests per 15 minutes per IP
- **Request Body:**
  ```json
  {
    "email": "student@university.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Account created and anonymous identity generated",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "_id": "673...",
      "email": "student@university.edu",
      "role": "user"
    },
    "identity": {
      "_id": "673...",
      "pseudonym": "QuietEcho#4021",
      "avatarColor": "#8b5cf6",
      "bio": "A gentle voice wandering in the echoes."
    }
  }
  ```

### `POST /api/auth/login`
Authenticates existing credentials and issues a signed JWT.
- **Rate Limit:** 100 requests per 15 minutes per IP
- **Request Body:**
  ```json
  {
    "email": "student@university.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):** Returns token, user, and public identity.

### `POST /api/auth/logout`
Acknowledges client session logout. EchoRoom uses stateless Bearer JWTs, so the client discards the token from local/session storage upon receiving the response.
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Logged out successfully. Please remove your authentication token from client storage."
  }
  ```

### `GET /api/auth/me`
Retrieves current authenticated account state and public identity.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": { "_id": "673...", "email": "student@university.edu", "role": "user" },
    "identity": { "pseudonym": "QuietEcho#4021", "avatarColor": "#8b5cf6", "bio": "..." }
  }
  ```

### `PATCH /api/identity/me`
Allows the user to safely update their anonymous bio or regenerate their avatar color without breaking anonymity.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "bio": "Studying late nights at the campus library.",
    "avatarColor": "#10b981"
  }
  ```

---

## 2. Anonymous Thoughts Feed (`/api/thoughts`)

### `GET /api/thoughts`
Public paginated stream of active, unexpired thoughts.
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 50)
  - `emotion` (string: `Happy`, `Sad`, `Confused`, `Frustrated`, `Hopeful`, `Lonely`, `Grateful`, `Motivated`, `All`)
  - `topic` (string, e.g. `exams`, `loneliness`)
  - `sort` (string: `newest`, `popular`, default: `newest`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 10,
    "pagination": { "total": 28, "page": 1, "limit": 10, "totalPages": 3 },
    "data": [
      {
        "_id": "673...",
        "content": "Finding peace in the late hours of the semester.",
        "emotion": "Hopeful",
        "topics": ["finals", "peace"],
        "empathyCounts": {
          "understand": 4,
          "not_alone": 8,
          "support": 3,
          "relate": 5,
          "thanks": 1,
          "total": 21
        },
        "commentCount": 2,
        "authorIdentity": {
          "pseudonym": "Solar Meadow#6040",
          "avatarColor": "#3b82f6"
        },
        "expiresAt": "2026-11-20T10:00:00.000Z",
        "createdAt": "2026-11-13T10:00:00.000Z"
      }
    ]
  }
  ```

### `POST /api/thoughts`
Creates and publishes a new anonymous reflection.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "content": "I feel like everyone else has their career paths figured out while I'm drifting.",
    "emotion": "Confused",
    "topics": ["career", "future", "college"],
    "expirationSetting": "7d"
  }
  ```
- **Validation:**
  - `content`: 3 to 2,000 characters
  - `emotion`: Must be one of the 8 canonical values
  - `expirationSetting`: `never`, `24h`, `3d`, `7d`
- **Response (201 Created):** Returns populated thought object.

### `GET /api/thoughts/:id`
Retrieves a single thought by ID, its author identity, and empathy statistics.

### `GET /api/thoughts/discover`
Returns a random active thought utilizing MongoDB's `$sample` aggregation for serendipitous discovery.

### `GET /api/thoughts/search?q=query`
Performs sanitized regex keyword search across thought contents and topic tags.

### `PATCH /api/thoughts/:id`
Allows the original author to update their reflection content, emotion, or topic tags.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "content": "Updated reflection text...",
    "emotion": "Hopeful",
    "topics": ["healing", "growth"]
  }
  ```
- **Authorization:** Only the original author's persona may edit (`403 Forbidden` if requested by another user).
- **Response (200 OK):** Returns the updated thought object.

### `DELETE /api/thoughts/:id`
Allows the original author (or an administrator) to withdraw their thought permanently (`status: "removed"`).
- **Headers:** `Authorization: Bearer <token>`
- **Authorization:** Author or Administrator role required (`403 Forbidden` otherwise).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Thought removed from the echoes"
  }
  ```

---

## 3. Empathy Reactions, Comments & Bookmarks

### `POST /api/thoughts/:id/empathy`
Toggles an empathy reaction on a thought.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "reactionType": "understand"
  }
  ```
  *Allowed values:* `understand`, `not_alone`, `support`, `relate`, `thanks`
- **Behavior:**
  - If the reaction does not exist: adds reaction and increments counter (`action: "added"`).
  - If the same reaction is clicked again: toggles off and decrements counter (`action: "removed"`).
  - A compound unique database index prevents duplicate spam.

### `POST /api/thoughts/:id/comments`
Leaves an anonymous comment on a thought.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "content": "You are not drifting alone. I felt the exact same way during sophomore year."
  }
  ```

### `GET /api/thoughts/:id/comments`
Lists all comments for a thought in chronological order with populated anonymous author personas.

### `DELETE /api/thoughts/:id/comments/:commentId`
Deletes a comment if requested by the comment's author or the parent thought's creator.

### `POST /api/thoughts/:id/save`
Bookmarks or unbookmarks a thought for the authenticated user.

### `GET /api/saved`
Retrieves all bookmarked thoughts for the authenticated user.

---

## 4. Real-Time Discussion Rooms (`/api/rooms` & Socket.IO)

### `GET /api/rooms`
Lists active discussion rooms with active participant count and topic tags.

### `GET /api/rooms/:id`
Retrieves details and recent message history for a single discussion room.
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "room": {
        "_id": "673...",
        "title": "Late Night Anxiety & Midterm Burnout",
        "topic": "Academics",
        "creatorIdentity": { "secretUsername": "QuietEcho#4021", "avatarColor": "#8b5cf6" },
        "activeParticipants": 2,
        "isClosed": false
      },
      "messages": [
        {
          "_id": "673...",
          "content": "Sending warmth to everyone studying tonight.",
          "senderIdentity": { "secretUsername": "WanderingSoul#1022" },
          "createdAt": "2026-11-13T10:00:00.000Z"
        }
      ]
    }
  }
  ```

### `POST /api/rooms`
Creates a new discussion room.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "title": "Late Night Anxiety & Midterm Burnout",
    "topic": "Academics",
    "description": "A calm, supportive space to decompress."
  }
  ```

### `POST /api/rooms/:id/close`
Peacefully closes the room. Only the room creator or an admin may close a room. Broadcasts a `room:closed` event to all connected sockets.

### Socket.IO Protocol (`/`)

#### Connection Handshake
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'Bearer <token>' },
  transports: ['websocket', 'polling']
});
```

#### Client Emitters
- `room:join` (`{ roomId: string }`): Join room channel.
- `room:leave` (`{ roomId: string }`): Gracefully leave room channel.
- `message:send` (`{ roomId: string, content: string }`): Broadcast message (rate limited: 1 msg per 600ms).

#### Server Listeners / Broadcasts
- `room:joined` (`{ roomId, roomTitle, messages }`): Delivered upon joining with recent message history.
- `room:participants` (`{ count: number }`): Live participant counter broadcast.
- `room:message` (`{ _id, content, senderIdentity, createdAt }`): Real-time chat message broadcast.
- `room:closed` (`{ message: string }`): Notifies room participants when host closes the session.
- `room:error` (`{ message: string }`): Error alerts (rate limit, unauthorized).

---

## 5. Analytics & Moderation (`/api/analytics`, `/api/reports`, `/api/admin`)

### `GET /api/analytics/community`
Public endpoint computing aggregated community empathy metrics:
- Dominant community emotion
- Total active thoughts and empathy reactions
- Active real-time rooms
- Emotion distribution percentage breakdown
- Trending topic tags
- 7-day thought activity timeline

### `POST /api/reports`
Submits a content violation report for moderation review.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "targetModel": "Thought",
    "targetId": "673...",
    "reason": "spam",
    "details": "Repeated advertisement links posted in reflection."
  }
  ```
  *Allowed reasons:* `harassment`, `hate_speech`, `spam`, `inappropriate`, `self_harm`, `other`

### `GET /api/admin/reports`
Admin-only endpoint retrieving pending moderation queue.
- **Headers:** `Authorization: Bearer <admin_token>`

### `PATCH /api/admin/reports/:id`
Updates report triage status (`reviewed`, `resolved`, `dismissed`).

### `PATCH /api/admin/users/:id/restriction`
Toggles account active state (`isActive: false` bans user from publishing or chatting).

---

## 6. System Health & Readiness (`GET /api/health`, `GET /api/ready`)

### `GET /api/health`
Returns real-time service uptime and MongoDB connection state (returns HTTP 503 in production if MongoDB is disconnected):
```json
{
  "status": "ok",
  "service": "EchoRoom API",
  "version": "1.0.0",
  "uptime": 1284.52,
  "timestamp": "2026-11-13T17:30:00.000Z",
  "database": {
    "status": "connected",
    "readyState": 1
  }
}
```

### `GET /api/ready`
Dedicated readiness probe for cloud orchestrators (Render, Kubernetes, Railway):
- **Returns 200 OK** when MongoDB replica set is connected:
  ```json
  { "status": "ready", "database": "connected" }
  ```
- **Returns 503 Service Unavailable** when MongoDB is disconnected:
  ```json
  { "status": "not_ready", "database": "disconnected" }
  ```

