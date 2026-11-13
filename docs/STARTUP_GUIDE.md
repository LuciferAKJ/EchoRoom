# EchoRoom — Windows Developer Startup Guide

This guide provides practical, step-by-step instructions for setting up, configuring, and running **EchoRoom** locally on a Windows PC using VS Code, Antigravity, or PowerShell.

---

## 1. Prerequisites Installation

Before running the project, ensure you have the following installed on your Windows machine:

1. **Node.js (v18 or higher; v20+ recommended)**:
   - Download the Windows Installer (.msi) from [nodejs.org](https://nodejs.org).
   - Verify installation in PowerShell:
     ```powershell
     node -v
     npm -v
     ```
2. **Git for Windows**:
   - Download from [git-scm.com](https://git-scm.com).
   - Verify installation:
     ```powershell
     git --version
     ```
3. **MongoDB Atlas Account (or Local MongoDB Community Server)**:
   - A free cloud cluster at [cloud.mongodb.com](https://cloud.mongodb.com) (recommended).
   - Ensure you whitelist IP `0.0.0.0/0` (Allow Access From Anywhere) under **Network Access** so your machine can connect.

---

## 2. Opening the Project

1. Open your terminal (PowerShell or Windows Terminal) or code editor (VS Code / Antigravity).
2. Navigate to the project directory:
   ```powershell
   cd C:\Users\adity\Downloads\Echoroom
   ```

---

## 3. Installing Dependencies

EchoRoom uses a clean modular structure with two separate `package.json` files:

### Backend Dependencies
Open your terminal and run:
```powershell
cd C:\Users\adity\Downloads\Echoroom\backend
npm install
```

### Frontend Dependencies
Open a second terminal or run:
```powershell
cd C:\Users\adity\Downloads\Echoroom\frontend
npm install
```

---

## 4. Environment Variables Configuration

Both the frontend and backend require a `.env` configuration file. Templates are provided via `.env.example`.

### Backend Configuration (`backend/.env`)
1. In `C:\Users\adity\Downloads\Echoroom\backend\`, check if `.env` exists. If not, copy `.env.example`:
   ```powershell
   cd C:\Users\adity\Downloads\Echoroom\backend
   Copy-Item .env.example .env
   ```
2. Open `backend/.env` in your editor and configure the variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<your_username>:<your_password>@cluster0.xxxxx.mongodb.net/echoroom?retryWrites=true&w=majority
   JWT_SECRET=echoroom_jwt_development_secret_key_change_in_production
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```
   *(Replace `<your_username>` and `<your_password>` with your actual MongoDB Atlas database user credentials).*

> **Windows DNS Note:** EchoRoom's `backend/src/config/db.js` automatically uses public Google & Cloudflare DNS servers (`8.8.8.8`, `1.1.1.1`) to resolve `mongodb+srv://` connection strings smoothly without Windows SRV lookup timeouts.

### Frontend Configuration (`frontend/.env`)
1. In `C:\Users\adity\Downloads\Echoroom\frontend\`, check if `.env` exists. If not, copy `.env.example`:
   ```powershell
   cd C:\Users\adity\Downloads\Echoroom\frontend
   Copy-Item .env.example .env
   ```
2. Verify the contents:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

---

## 5. Starting the Development Servers

For the full application to work, **both** the backend API and frontend Vite servers must run concurrently. Open two separate PowerShell terminal windows:

### Terminal 1 — Start Backend Server
```powershell
cd C:\Users\adity\Downloads\Echoroom\backend
npm run dev
```
**Expected Output:**
```
[Database] MongoDB connected: cluster0...mongodb.net
EchoRoom Backend running on port 5000 in development mode
Health check: http://localhost:5000/api/health
```

### Terminal 2 — Start Frontend Server
```powershell
cd C:\Users\adity\Downloads\Echoroom\frontend
npm run dev
```
**Expected Output:**
```
  VITE v8.3.8  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 6. Accessing the Application

1. Open your browser and navigate to:
   **`http://localhost:5173`**
2. Check the API health check in your browser:
   **`http://localhost:5000/api/health`**
   - Expected response: `{"status":"ok","service":"EchoRoom API","database":{"status":"connected","readyState":1}}`

---

## 7. How to Stop the Servers

To stop either server gracefully:
- In the active PowerShell terminal window, press **`Ctrl + C`**.
- When prompted `Terminate batch job (Y/N)?`, type **`Y`** and press **Enter**.

---

## 8. Troubleshooting Common Windows Issues

### 1. `EADDRINUSE: address already in use :::5000`
- **Cause:** Another background Node.js process is already occupying port 5000.
- **Fix:** In PowerShell, find and kill the process:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```

### 2. `querySrv ECONNREFUSED`
- **Cause:** Windows local DNS resolver failed to resolve the MongoDB Atlas SRV record.
- **Fix:** EchoRoom includes automated DNS resolver overrides in `backend/src/config/db.js`. Ensure your computer has active internet access.

### 3. Frontend Cannot Connect to Backend
- **Check 1:** Ensure Terminal 1 (backend) is actively running and shows `MongoDB connected`.
- **Check 2:** Verify `frontend/.env` contains `VITE_API_URL=http://localhost:5000/api`.
- **Check 3:** Open `http://localhost:5000/api/health` directly in Chrome/Edge to ensure the API is responding.

### 4. Running the Tests
To verify all automated tests anytime:
```powershell
# In backend:
cd C:\Users\adity\Downloads\Echoroom\backend
npm test

# In frontend:
cd C:\Users\adity\Downloads\Echoroom\frontend
npm test
```
