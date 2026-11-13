# EchoRoom — Comprehensive Testing Guide & Verification Runbook

This document details the automated test suite results and provides manual testing scenarios for evaluating **EchoRoom – Anonymous Thoughts & Empathy Platform**.

---

## 1. Automated Test Execution

### A. Backend Automated Suites (`backend/package.json -> npm test`)
Run in PowerShell:
```powershell
cd C:\Users\adity\Downloads\Echoroom\backend
npm test
```
**Test Command:** `node --test tests/api.test.js && node tests/socketTest.js`  
**Execution Environment:** Node.js v25+ with live MongoDB Atlas connection  
**Overall Status:** **100% PASS**

#### Test Breakdown Matrix

| Suite / Test Case | Type | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| `GET /api/health` | Health Check | Status 200, DB state `1` (connected) | Returns 200, `readyState: 1` in 75ms | **PASS** |
| `GET /api/ready` | Readiness Probe | Status 200, database connected | Returns 200 with `{ status: "ready" }` | **PASS** |
| `getJwtSecret` Production Check | Security Config | Throws on weak/missing in production | Rejects short/placeholder secrets | **PASS** |
| `POST /api/auth/register` (New) | Auth | Status 201, JWT returned, password redacted | User created, persona generated, token returned | **PASS** |
| `POST /api/auth/register` (Duplicate) | Auth | Status 409 Conflict | Returns 409 with "already exists" error | **PASS** |
| `POST /api/auth/login` (Valid) | Auth | Status 200, JWT returned | Returns 200, JWT token returned | **PASS** |
| `POST /api/auth/login` (Invalid) | Auth | Status 401 Unauthorized | Returns 401 with "invalid credentials" error | **PASS** |
| `GET /api/auth/me` | Auth Profile | Status 200, persona details returned | Returns 200, returns pseudonym and color | **PASS** |
| `POST /api/thoughts` (Valid) | Thoughts CRUD | Status 201, valid emotion persisted | Returns 201, thought created with author identity | **PASS** |
| `POST /api/thoughts` (Invalid Emotion) | Thoughts CRUD | Status 400 Bad Request | Returns 400 with "Invalid emotion" error | **PASS** |
| `PATCH /api/thoughts/:id` (Author) | Thought Editing | Status 200, content updated | Returns 200, content updated by author | **PASS** |
| `PATCH /api/thoughts/:id` (Non-Author) | Authorization | Status 403 Forbidden | Returns 403 with "only edit thoughts you shared" | **PASS** |
| `DELETE /api/thoughts/:id` (Non-Author) | Authorization | Status 403 Forbidden | Returns 403 with "not authorized" error | **PASS** |
| `GET /api/thoughts?emotion=Hopeful` | Feed Query | Status 200, filtered pagination array | Returns 200, matches filtered emotion | **PASS** |
| `GET /api/thoughts/:id` | Thoughts CRUD | Status 200, populated author persona | Returns 200 with populated anonymous author | **PASS** |
| `GET /api/thoughts/discover` | Serendipity | Status 200, random unread thought | Returns 200 via MongoDB `$sample` aggregation | **PASS** |
| `GET /api/thoughts/search?q=...` | Keyword Search | Status 200, matching array | Returns 200, finds thought by content text | **PASS** |
| `POST /api/thoughts/:id/empathy` (Add) | Empathy | Status 200, atomic increment | Returns 200, `action: "added"`, counter increments | **PASS** |
| `POST /api/thoughts/:id/empathy` (Remove) | Empathy | Status 200, atomic decrement | Returns 200, `action: "removed"`, counter decrements | **PASS** |
| `POST /api/thoughts/:id/comments` | Comments | Status 201, anonymous comment created | Returns 201, author pseudonym attached | **PASS** |
| `GET /api/thoughts/:id/comments` | Comments | Status 200, chronological list | Returns 200, lists created comment | **PASS** |
| `POST /api/thoughts/:id/save` | Bookmarks | Status 200, `isSaved: true` | Returns 200, saved record created | **PASS** |
| `GET /api/saved` | Bookmarks | Status 200, list of bookmarked thoughts | Returns 200, contains saved thought | **PASS** |
| `GET /api/analytics/community` | Analytics | Status 200, emotion breakdown | Returns 200, totals & distribution computed | **PASS** |
| `POST /api/reports` | Moderation | Status 201, report status `pending` | Returns 201, report filed for admin triage | **PASS** |
| `GET /api/admin/reports` (Non-Admin) | RBAC Security | Status 403 Forbidden | Returns 403 with "permission" denial | **PASS** |
| `GET /api/rooms/:id` (Unauthenticated) | Auth Security | Status 401 Unauthorized | Rejects request before querying database | **PASS** |
| Unauthorized Socket Connection | Socket Auth | Connection rejected | Returns `connect_error: Authentication token required` | **PASS** |
| Unauthorized Socket Message | Socket Security | Emission rejected | Returns `room:error: You must join this room before sending messages` | **PASS** |
| Multi-Client Socket.IO Room Joining | Real-Time | Handshake authenticated, count = 2 | Both clients connect and receive `room:joined` | **PASS** |
| Real-Time Message Exchange | Real-Time | Client B receives Client A's message | Client B receives broadcast in < 20ms | **PASS** |
| Client Leaves Room Presence | Real-Time | Participant count decrements to 1 | Client A receives updated presence count = 1 | **PASS** |
| Room Closure Broadcast | Real-Time | Host closes room, broadcast sent | Client B receives `room:closed` notification | **PASS** |

---

### B. Frontend Automated Suites (`frontend/package.json -> npm test`)
Run in PowerShell:
```powershell
cd C:\Users\adity\Downloads\Echoroom\frontend
npm test
```
**Test Command:** `node --test src/test/**/*.test.js`  
**Execution Environment:** Node.js v25+  
**Overall Status:** **100% PASS (9 tests passed in 341ms)**

| Suite | Purpose | Status |
|---|---|---|
| `emotionTheme.test.js` | Verifies 8 canonical emotions, semantic badges, dot styles, relative time math | **PASS** |
| `authStorage.test.js` | Verifies JWT storage serialization and pseudonym regex validation (`QuietEcho#4021`) | **PASS** |
| `queryFilter.test.js` | Verifies URL search query builder, emotion filters, and pagination page math | **PASS** |

### C. Frontend React Component Tests (`frontend/package.json -> npm run test:vitest`)
Run in PowerShell:
```powershell
cd C:\Users\adity\Downloads\Echoroom\frontend
npm run test:vitest
```
**Test Command:** `vitest run`  
**Execution Environment:** Vitest v4, React Testing Library, JSDOM  
**Overall Status:** **100% PASS (8 component tests across 3 suites)**

| Suite | Component Tested | Purpose | Status |
|---|---|---|---|
| `Button.test.jsx` | `Button` | Verifies rendering children, click event firing, disabled state, and loading spinner | **PASS** |
| `Input.test.jsx` | `Input` | Verifies label association, text input typing, and validation error styles | **PASS** |
| `Card.test.jsx` | `Card` | Verifies card hierarchy, title container, and content slot rendering | **PASS** |

---

## 2. End-to-End Manual Testing Runbook

Follow these 20 steps to manually test the complete user journey in a web browser.

### Prerequisites:
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`

---

### Phase A: Onboarding & Authentication
1. **Visit EchoRoom**: Open `http://localhost:5173`. Verify the calm editorial landing page loads with headline and "Explore Thoughts" CTA.
2. **Register**: Click "Create Anonymous Identity" or navigate to `/register`.
   - Enter email: `student_demo@univ.edu`
   - Enter password: `Password123!`
   - Submit. Verify redirection to `/feed` and notice the generated persona badge (e.g., `Patient Voyager #5070`) in the desktop sidebar or mobile header.
3. **Log Out & Log Back In**:
   - Click "Log Out" at the bottom of the sidebar.
   - Navigate to `/login`.
   - Enter `student_demo@univ.edu` and `Password123!`.
   - Verify login succeeds and your persona badge is restored.
4. **Customize Identity**:
   - Click "Identity & Settings" in the sidebar (`/settings`).
   - Update your anonymous bio: *"Reflecting quietly during midterm week."*
   - Pick a new avatar color tone.
   - Click "Save Changes". Verify the updated bio and color persist.

---

### Phase B: Sharing & Discovering Thoughts
5. **Publish a Thought**:
   - Click "Share Thought" (`/create`).
   - Content: *"Sometimes the quietest hours of the night bring the most clarity."*
   - Emotion: Select **Hopeful**.
   - Topic Tags: Type `night`, `clarity`, `peace`.
   - Lifespan: Choose **24 Hours**.
   - Click "Release Thought".
6. **Feed Verification**:
   - You are redirected to `/feed`.
   - Verify your newly posted reflection appears at the very top of the feed with a **Hopeful** badge and your pseudonym.
7. **Filter by Emotion**:
   - In the feed, click the **Hopeful** filter pill. Verify your thought remains visible.
   - Click the **Sad** filter pill. Verify your thought disappears and only sad thoughts appear.
   - Click **All** to reset.
8. **Serendipitous Discovery**:
   - Click "Serendipity" in the sidebar (`/discover`).
   - Verify a single random reflection appears.
   - Click "Discover Another" to verify a new random thought is fetched.

---

### Phase C: Empathy & Discussion
9. **Toggle Empathy Reaction**:
   - In the feed or detail view, locate a thought.
   - Click the "I understand" or "You're not alone" button.
   - Verify the counter immediately increases from `0` to `1`.
   - Click it again. Verify it toggles off and drops back to `0`.
10. **Add a Comment**:
    - Click on the thought to open its details (`/thought/:id`).
    - In the response input, type: *"Thank you for sharing this, it resonated deeply."*
    - Click "Post Response".
    - Verify your comment appears immediately in the discussion list below the thought.
11. **Bookmark (Save) Thought**:
    - Click the bookmark icon on the thought.
    - Navigate to "Saved" in the sidebar (`/saved`).
    - Verify the thought is listed in your bookmarks.
    - Click the bookmark icon again to unsave it; verify it is removed from the list.

---

### Phase D: Real-Time Discussion Rooms (Requires 2 Sessions)
12. **Create Room in Session 1**:
    - Navigate to "Rooms" (`/rooms`).
    - Click "Create Room".
    - Title: *"Late Night University Reflections"*
    - Topic: *"Academics"*
    - Click "Open Room". You will enter the live chat view (`/rooms/:id`).
13. **Join Room from Session 2 (Incognito / Second Browser)**:
    - Open an Incognito window and navigate to `http://localhost:5173/login`.
    - Log in with a second account (or register a second demo user).
    - Navigate to "Rooms" and click on the newly opened room *"Late Night University Reflections"*.
14. **Test Real-Time Chat**:
    - In Session 1, send: *"Hello from Session 1 in the quiet echoes!"*
    - Check Session 2: Verify the message appears **instantly** without refreshing the page.
    - In Session 2, reply: *"Received loud and clear in Session 2!"*
    - Check Session 1: Verify the reply appears instantly.
    - Check the top header: Verify participant count displays `2 Participants`.
15. **Close Room**:
    - In Session 1 (the creator), click "Close Room".
    - Verify both sessions receive the notice: *"This discussion room has been peacefully concluded by its creator."*

---

### Phase E: Moderation & Safety
16. **Submit a Content Report**:
    - On any thought detail page, click the flag icon ("Report").
    - Select violation reason: **Spam**.
    - Details: *"Unrelated commercial link."*
    - Click "Submit Report".
    - Verify the confirmation: *"Report submitted. Our moderation team will review this shortly."*
17. **View Admin Queue (If logged in as Admin)**:
    - If user role is `admin`, navigate to `/admin`.
    - Verify the report appears in the triage queue with target type, reason, and status `pending`.
    - Click "Resolve" or "Dismiss". Verify the status updates accordingly.

---

### Phase F: Negative & Failure Testing
18. **Unauthenticated Access**:
    - Log out and attempt to visit `/create` or `/saved`.
    - Verify the application prompts you to log in or redirects safely.
19. **Input Validation**:
    - In `/create`, try submitting a thought with only 1 character.
    - Verify the form blocks submission with an error: *"Thought content must be at least 3 characters."*
20. **Duplicate Account**:
    - In `/register`, try registering with `student_demo@univ.edu` again.
    - Verify the error banner: *"An account with this email address already exists."*

