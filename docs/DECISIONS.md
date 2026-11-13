# EchoRoom — Architectural & Technical Decisions Log

This document records the key architectural choices, design rationale, and technical trade-offs made during the development of EchoRoom.

---

### Decision 1: Separation of Private Identity and Public Anonymous Identity
- **Context:** EchoRoom requires anonymous expression while maintaining account accountability for trust and safety.
- **Decision:** Users have a private `User` record (storing email, hashed password, role, account status) and one or more `AnonymousIdentity` records (storing generated pseudonyms, visual avatar tones, bio).
- **Rationale:** 
  1. Complete anonymity without backend accountability invites abuse and illegal content.
  2. Public API endpoints project only the `AnonymousIdentity` fields (`pseudonym`, `avatarColor`), strictly stripping `email`, `userId`, or private identifiers.
  3. Authorised moderation retains the encrypted relation to restrict toxic actors without publicly exposing who they are.

---

### Decision 2: Single-Page Application with React 19, Vite, and Tailwind CSS
- **Context:** We need a rapid, modern, responsive frontend with high performance and clean styling.
- **Decision:** React 19 SPA built with Vite and Tailwind CSS.
- **Rationale:** 
  - Standard, student-friendly code without unnecessary framework overhead (like Next.js SSR server complexities).
  - Fast HMR during development with Vite.
  - Tailwind CSS allows building a calm, bespoke midnight/lavender design system without heavy component libraries.

---

### Decision 3: Thought Expiration Strategy (Dual-Layer: Query Filter + MongoDB TTL)
- **Context:** Thoughts can expire after 24 hours, 3 days, 7 days, or never.
- **Decision:** Dual-layer expiration:
  1. Schema field `expiresAt: Date` with a MongoDB TTL index for automatic physical document purging by the database engine.
  2. Query layer filtering: All public thought queries include `{ $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }`.
- **Rationale:** MongoDB TTL thread runs periodically (typically once per minute). The query filter ensures an expired thought is immediately hidden from the public feed the exact second it expires, even before MongoDB's background worker sweeps it.

---

### Decision 4: Real-Time Communication with Socket.IO & Persistent Chat History
- **Context:** Discussion rooms need real-time messaging, presence tracking, and message history when participants join.
- **Decision:** Native Socket.IO on the Express HTTP server with JWT handshake authentication and MongoDB-backed `RoomMessage` persistence.
- **Rationale:** 
  - Socket.IO provides built-in reconnection, room clustering, and heartbeat mechanisms.
  - Persisting room messages in MongoDB allows users who refresh or join late to review recent conversation context up to a limit.

---

### Decision 5: Non-Toxic Interaction Design (Empathy Reactions over "Likes")
- **Context:** Standard social networks incentivize vanity, doom-scrolling, and outrage through like counts and downvotes.
- **Decision:** Replace binary "likes" with 5 empathetic responses:
  1. *I understand*
  2. *You're not alone*
  3. *Sending support*
  4. *I relate to this*
  5. *Thank you for sharing*
- **Rationale:** Reinforces the core mission of psychological safety, validation, and vulnerability rather than social competition.
