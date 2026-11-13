# EchoRoom Database Architecture & Schema Documentation

EchoRoom uses **MongoDB Atlas** with **Mongoose ODM**. The database design is architected to guarantee **absolute anonymity for users** while maintaining high query performance, relational integrity, automatic content expiration, and real-time empathy tracking.

---

## Architecture Principles

1. **Strict Anonymity Partitioning:**
   - User account credentials (`email`, `passwordHash`) live in the `users` collection.
   - Public personas (`pseudonym`, `avatarColor`, `bio`) live in the `anonymousidentities` collection.
   - All public relations (`thoughts`, `comments`, `roommessages`, `empathyresponses`) reference `authorIdentity` / `senderIdentity`, completely detaching public actions from personal emails.
   - The private user ID is only stored on `Report` and `SavedThought` records and is shielded from public serialization.

2. **Dual-Layer Expiration Engine:**
   - **Engine Layer:** MongoDB native TTL index (`expiresAt`, `expireAfterSeconds: 0`) purges expired documents automatically in the background.
   - **Application Layer:** Query filter `getActiveFilter()` immediately filters out any record where `expiresAt < now` so that thoughts never linger in feeds during the background sweep window.

3. **Compound Unique Anti-Spam Constraints:**
   - Prevents duplicate empathy reactions (`{ thought: 1, user: 1, reactionType: 1 }`).
   - Prevents duplicate bookmarks (`{ user: 1, thought: 1 }`).

---

## Entity-Relationship Overview

```
 [User] (private)
    │ 1:1
    ▼
 [AnonymousIdentity] (public persona)
    ├── 1:N ──► [Thought]
    │             ├── 1:N ──► [EmpathyResponse]
    │             └── 1:N ──► [Comment]
    ├── 1:N ──► [DiscussionRoom]
    │             └── 1:N ──► [RoomMessage]
    ├── 1:N ──► [SavedThought] (Bookmarks)
    └── 1:N ──► [Report] (Moderation Triage)
```

---

## Schema Reference (All 9 Models)

### 1. `User` (`backend/src/models/User.js`)
Stores private authentication credentials.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Primary Key |
| `email` | String | Required, Unique, Lowercase, Trim | Private login email address |
| `passwordHash` | String | Required | Bcrypt salt hash (never selected by default) |
| `role` | String | Enum: `['user', 'moderator', 'admin']` | RBAC role |
| `isActive` | Boolean | Default: `true` | Moderation account suspension flag |
| `createdAt` | Date | Timestamp | Account creation timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

**Indexes:**
- `{ email: 1 }` (Unique)

---

### 2. `AnonymousIdentity` (`backend/src/models/AnonymousIdentity.js`)
Stores the public, anonymized persona linked to a user.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Primary Key |
| `userId` | ObjectId | Ref: `User`, Required, Unique | 1:1 link to private user account |
| `pseudonym` | String | Required, Unique, Trim | Generated handle (e.g., `QuietEcho#4021`) |
| `avatarColor` | String | Default: `#8b5cf6` | Hex color code for avatar circle |
| `bio` | String | Max: 160 chars | Optional anonymous self-description |

**Indexes:**
- `{ userId: 1 }` (Unique)
- `{ pseudonym: 1 }` (Unique)

---

### 3. `Thought` (`backend/src/models/Thought.js`)
The core reflection object released by anonymous identities.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Primary Key |
| `authorIdentity` | ObjectId | Ref: `AnonymousIdentity`, Required | The public persona author |
| `content` | String | Required, 3–2000 chars, Trim | Thought content text |
| `emotion` | String | Enum: `['Happy', 'Sad', 'Confused', 'Frustrated', 'Hopeful', 'Lonely', 'Grateful', 'Motivated']` | Emotional classification |
| `topics` | [String] | Array of lowercase strings | Searchable topic tags |
| `expirationSetting` | String | Enum: `['never', '24h', '3d', '7d']` | User-chosen lifecycle duration |
| `expiresAt` | Date | Sparse, Index | Computed absolute expiration datetime |
| `status` | String | Enum: `['active', 'hidden', 'deleted']` | Lifecycle & moderation state |
| `empathyCounts` | Subdoc | Object with counters | `understand`, `not_alone`, `support`, `relate`, `thanks`, `total` |
| `commentCount` | Number | Default: `0` | Denormalized count of comments |

**Indexes:**
- `{ expiresAt: 1 }` with `{ expireAfterSeconds: 0 }` (MongoDB TTL background sweep)
- `{ status: 1, emotion: 1, createdAt: -1 }` (Compound feed query index)
- `{ status: 1, topics: 1, createdAt: -1 }` (Topic filter index)
- `{ content: 'text', topics: 'text' }` (Text search index)

---

### 4. `EmpathyResponse` (`backend/src/models/EmpathyResponse.js`)
Atomic empathy reactions on thoughts.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Primary Key |
| `thought` | ObjectId | Ref: `Thought`, Required | Thought receiving reaction |
| `identity` | ObjectId | Ref: `AnonymousIdentity`, Required | Anonymous persona of reactor |
| `user` | ObjectId | Ref: `User`, Required, Select: false | Private user reference for anti-spam check |
| `reactionType` | String | Enum: `['understand', 'not_alone', 'support', 'relate', 'thanks']` | Empathy type |
| `createdAt` | Date | Timestamp | When reaction was registered |

**Indexes:**
- `{ thought: 1, user: 1, reactionType: 1 }` (Compound Unique Index: prevents multiple reactions of same type)
- `{ thought: 1, reactionType: 1 }` (Aggregated lookup)

---

### 5. `Comment` (`backend/src/models/Comment.js`)
Supportive anonymous comments left on thoughts.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Primary Key |
| `thought` | ObjectId | Ref: `Thought`, Required, Index | Target thought |
| `authorIdentity` | ObjectId | Ref: `AnonymousIdentity`, Required | Commenter persona |
| `authorUser` | ObjectId | Ref: `User`, Required, Select: false | Private author reference for deletion rights |
| `content` | String | Required, 1–1000 chars, Trim | Comment message body |
| `status` | String | Enum: `['active', 'hidden', 'deleted']` | Status |

**Indexes:**
- `{ thought: 1, createdAt: 1 }` (Chronological thread index)

---

### 6. `DiscussionRoom` (`backend/src/models/DiscussionRoom.js`)
Real-time ephemeral group discussion channels.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Primary Key |
| `title` | String | Required, 3–100 chars, Trim | Discussion topic title |
| `topic` | String | Required, Trim | Primary topic classification |
| `description` | String | Max: 300 chars | Room purpose description |
| `creatorIdentity` | ObjectId | Ref: `AnonymousIdentity`, Required | Creator's public persona |
| `creatorUser` | ObjectId | Ref: `User`, Required, Select: false | Creator's private user ID |
| `activeParticipants` | Number | Default: `0` | Real-time presence counter |
| `isClosed` | Boolean | Default: `false` | Closure state flag |

**Indexes:**
- `{ isClosed: 1, createdAt: -1 }` (Active rooms listing index)

---

### 7. `RoomMessage` (`backend/src/models/RoomMessage.js`)
Ephemeral chat messages sent inside discussion rooms.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Primary Key |
| `room` | ObjectId | Ref: `DiscussionRoom`, Required, Index | Parent room |
| `senderIdentity` | ObjectId | Ref: `AnonymousIdentity`, Required | Sender public persona |
| `senderUser` | ObjectId | Ref: `User`, Required, Select: false | Sender user reference |
| `content` | String | Required, 1–500 chars, Trim | Message text |
| `createdAt` | Date | Timestamp | Message timestamp |

**Indexes:**
- `{ room: 1, createdAt: 1 }` (Room message stream index)

---

### 8. `Report` (`backend/src/models/Report.js`)
Community moderation flags for objectionable content.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Primary Key |
| `targetModel` | String | Enum: `['Thought', 'Comment', 'DiscussionRoom']` | Type of flagged item |
| `targetId` | ObjectId | RefPath: `targetModel`, Required | ID of flagged item |
| `reporterIdentity` | ObjectId | Ref: `AnonymousIdentity`, Default: null | Reporter persona |
| `reporterUser` | ObjectId | Ref: `User`, Required, Select: false | Reporter private user ID |
| `reason` | String | Enum: `['harassment', 'hate_speech', 'spam', 'inappropriate', 'self_harm', 'other']` | Violation category |
| `details` | String | Max: 500 chars | Supplemental explanation |
| `status` | String | Enum: `['pending', 'reviewed', 'resolved', 'dismissed']` | Triage status |

**Indexes:**
- `{ status: 1, createdAt: -1 }` (Admin triage queue index)
- `{ targetModel: 1, targetId: 1 }` (Target lookup index)

---

### 9. `SavedThought` (`backend/src/models/SavedThought.js`)
User bookmarks collection.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated PK | Primary Key |
| `user` | ObjectId | Ref: `User`, Required, Index | Private user reference |
| `thought` | ObjectId | Ref: `Thought`, Required, Index | Bookmarked reflection |
| `createdAt` | Date | Timestamp | Bookmark timestamp |

**Indexes:**
- `{ user: 1, thought: 1 }` (Compound Unique Index: prevents duplicate bookmarks)
