# EchoRoom Production Deployment Guide

This guide provides end-to-end instructions for deploying **EchoRoom** online to production using **Vercel** (for the React SPA frontend) and **Render** (for the Node.js & WebSocket backend) connected to a free **MongoDB Atlas** cluster.

---

## Architecture Overview

```
                      ┌────────────────────────────┐
                      │    Vercel Cloud Hosting    │
                      │    (React 19 Vite SPA)     │
                      │  https://echoroom.vercel.app│
                      └──────────────┬─────────────┘
                                     │
                    HTTP API Requests│ WebSockets
                                     │
                      ┌──────────────▼─────────────┐
                      │    Render Web Service      │
                      │   (Node.js + Socket.IO)    │
                      │https://echoroom.onrender.com│
                      └──────────────┬─────────────┘
                                     │
                               Mongoose TLS
                                     │
                      ┌──────────────▼─────────────┐
                      │    MongoDB Atlas Cluster   │
                      │ (Replica Set + TTL Engine) │
                      └────────────────────────────┘
```

---

## Phase 1: MongoDB Atlas Configuration

1. **Log in to MongoDB Atlas:**
   Navigate to [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Configure Network Access (Whitelist):**
   - In the left sidebar, click **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   - *Why:* Render and Vercel use dynamic cloud IP pools. Whitelisting `0.0.0.0/0` allows secure TLS connections from cloud servers while protecting your data via database user credentials.
3. **Obtain Connection String:**
   - Under **Database**, click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the SRV connection URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/echoroom?retryWrites=true&w=majority
     ```
   - Ensure you replace `<username>` and `<password>` with your database user credentials.

---

## Phase 2: Deploy Backend to Render

Render supports persistent Node.js processes and WebSockets out of the box on its free tier.

1. **Push Code to GitHub:**
   Ensure your latest code is pushed to your GitHub repository:
   ```bash
   git add .
   git commit -m "chore: prepare for production deployment"
   git push origin main
   ```
2. **Create Web Service on Render:**
   - Log in to [dashboard.render.com](https://dashboard.render.com).
   - Click **New +** > **Web Service**.
   - Connect your GitHub repository (`Echoroom`).
3. **Configure Service Settings:**
   - **Name:** `echoroom-backend` (or a name of your choice)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`
4. **Configure Environment Variables on Render:**
   In the **Environment** tab, add the following variables:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production security & logging mode |
   | `PORT` | `5000` | Render will bind this internally |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster...` | Your Atlas connection string |
   | `JWT_SECRET` | *(64-character random string)* | E.g., generated with `openssl rand -hex 32` |
   | `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | Will be updated once Vercel is deployed |
5. **Deploy Service:**
   - Click **Deploy Web Service**.
   - Watch the build logs. Once complete, copy your Render service URL (e.g. `https://echoroom-backend.onrender.com`).
   - Test health check in your browser: `https://echoroom-backend.onrender.com/api/health`.

---

## Phase 3: Deploy Frontend to Vercel

1. **Log in to Vercel:**
   Navigate to [vercel.com](https://vercel.com) and log in with GitHub.
2. **Import Repository:**
   - Click **Add New...** > **Project**.
   - Select your `Echoroom` repository.
3. **Configure Project Settings:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Configure Environment Variables on Vercel:**
   Add the following environment variables:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://echoroom-backend.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://echoroom-backend.onrender.com` |
   *(Substitute your actual Render backend URL)*
5. **Deploy:**
   - Click **Deploy**.
   - Vercel will install dependencies, compile assets with Vite, and deploy your site to a global CDN.
   - Note your public URL (e.g. `https://echoroom.vercel.app`).
6. **Final Cross-Origin Synchronization:**
   - Return to Render > `echoroom-backend` > **Environment**.
   - Update `CLIENT_URL` to match your Vercel URL: `https://echoroom.vercel.app`.
   - Click **Save Changes** (Render will automatically redeploy with the updated CORS whitelist).

---

## Phase 4: Production Smoke Testing Checklist

After completing deployment, execute this 10-point smoke test to verify all layers:

- [ ] **1. Service Health:** Visit `https://your-backend.onrender.com/api/health`. Verify `status: "ok"` and `database.readyState: 1`.
- [ ] **2. Single Page Routing:** Navigate to `https://your-frontend.vercel.app/register` and reload the page. Verify Vercel doesn't return 404 (handled by `vercel.json`).
- [ ] **3. User Registration:** Create a new anonymous account. Verify the response yields a secret pseudonym (e.g., `QuietEcho#4021`) and avatar badge.
- [ ] **4. Account Login:** Log out and log back in. Verify the persona badge persists in the layout header.
- [ ] **5. Thought Publication:** Share an anonymous thought with an emotion tag (`Hopeful`) and expiration (`24h`). Verify it appears immediately at the top of the feed.
- [ ] **6. Emotion Filter:** Filter feed by `Hopeful`. Verify the feed updates dynamically without page reloads.
- [ ] **7. Empathy Reaction:** Click "I understand" or "You're not alone". Verify the live counter increments atomically without reloading.
- [ ] **8. Thought Details & Comments:** Click on the thought. Post an anonymous supportive comment. Verify it displays chronologically.
- [ ] **9. Real-Time Discussion Room:** Open two separate browser tabs (or an incognito window). Join the same discussion room. Send a message from Tab A and verify Tab B receives it instantaneously via WebSocket.
- [ ] **10. Analytics Dashboard:** Visit `/community-insights`. Verify the emotion breakdown chart and participation KPIs reflect the newly created data.
