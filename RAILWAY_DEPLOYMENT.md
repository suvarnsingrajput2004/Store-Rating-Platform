# Railway Deployment Guide — Store Rating Platform

> **Architecture**: Three Railway services in one project
> ```
> Railway Project: store-rating-platform
> ├── MySQL Plugin          (managed database)
> ├── Backend Service       (Node.js/Express API)
> └── Frontend Service      (React/Nginx SPA)
> ```
> Your local `docker-compose.yml` is **completely untouched** and continues to work as before.

---

## Prerequisites

- [x] Railway account at [railway.com](https://railway.com) (free tier works)
- [x] Railway CLI installed: `npm install -g @railway/cli`
- [x] GitHub account with this repo pushed
- [x] Docker Desktop (to verify locally before deploying)

---

## Step 1 — Verify Local Docker Still Works

Before touching Railway, confirm your local setup is still intact after the production changes.

```bash
cd store-rating-platform

# Build and start all local services
docker compose up --build

# In a new terminal, hit the health endpoint
curl http://localhost:5000/api/v1/health
# Expected: {"status":"OK","database":"connected","timestamp":"..."}

# Open the app
# http://localhost:3000
# Login: admin@store.com / Admin@123
```

> ✅ If this works, the production changes are backward-compatible. Proceed.

---

## Step 2 — Push to GitHub

```bash
cd store-rating-platform

# Check that .env files are gitignored (they should already be)
git status   # .env files must NOT appear in the list

# Stage and commit all the new Railway files
git add \
  backend/app.js \
  backend/Dockerfile \
  backend/railway.json \
  frontend/Dockerfile \
  frontend/nginx.conf \
  frontend/railway.json \
  database/init.sql \
  .env.production.example \
  RAILWAY_DEPLOYMENT.md

git commit -m "feat: add Railway production deployment configuration"

git push origin main
```

> ⚠️ **Security check**: Run `git status` and confirm `.env` and `backend/.env` are NOT staged. They are in `.gitignore` and must never be committed.

---

## Step 3 — Create Railway Project

1. Go to [railway.com](https://railway.com) → **New Project**
2. Choose **"Empty Project"**
3. Name the project: `store-rating-platform`

---

## Step 4 — Add MySQL Database Plugin

1. Inside your project, click **"+ New"** → **"Database"** → **"Add MySQL"**
2. Railway provisions a MySQL instance automatically
3. Click the **MySQL service** → **"Variables"** tab
4. Note these auto-generated variables (you'll reference them later):
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
   - `DATABASE_URL`

---

## Step 5 — Initialize the Database Schema

Railway's MySQL plugin starts empty. Run the schema once using the `init.sql` file.

### Option A — Using the Railway CLI (recommended)

```bash
# Login to Railway CLI
railway login

# Link to your project
railway link

# Get the MySQL connection string
railway variables --service MySQL

# Connect and run the init script
# Replace the values with those from Railway dashboard
mysql \
  -h <MYSQLHOST> \
  -P <MYSQLPORT> \
  -u <MYSQLUSER> \
  -p<MYSQLPASSWORD> \
  <MYSQLDATABASE> \
  < database/init.sql
```

### Option B — Using any MySQL client (TablePlus, DBeaver, etc.)

1. Railway dashboard → MySQL service → **"Connect"** tab → copy the connection string
2. Open your MySQL client and connect using those credentials
3. Open and run `database/init.sql`

> ✅ After running, you should see `Users`, `Stores`, and `Ratings` tables plus the admin seed row.

---

## Step 6 — Deploy the Backend Service

### 6a. Create the service

1. Railway project → **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Railway will detect the repo. **Before it deploys**, configure:
   - **Service Name**: `backend`
   - **Root Directory**: `store-rating-platform/backend`
     *(or the path relative to your repo root where `backend/` lives)*
   - **Dockerfile Path**: `Dockerfile` *(relative to Root Directory)*

### 6b. Set backend environment variables

Go to Backend service → **"Variables"** tab. Add each variable:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `JWT_SECRET` | *(generate: see below)* |
| `JWT_EXPIRES_IN` | `20m` |
| `ALLOWED_ORIGINS` | *(leave blank for now — fill in after frontend deploys)* |

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> 💡 The `${{MySQL.MYSQLHOST}}` syntax is Railway's variable reference — it auto-resolves to the MySQL plugin's value. You do NOT need to type the actual hostname.

> 💡 Do NOT set `PORT` — Railway injects it automatically.

### 6c. Generate a public URL for the backend

Backend service → **"Settings"** tab → **"Networking"** → **"Generate Domain"**

Note the URL, e.g.: `https://store-rating-backend-production.up.railway.app`

### 6d. Deploy

Railway automatically deploys when variables are saved. Watch the **"Deploy Logs"** tab.

**Expected log output:**
```
Database connected successfully.
Server running in production mode on port <PORT>
```

**Verify health check:**
```bash
curl https://your-backend.up.railway.app/api/v1/health
# Expected: {"status":"OK","database":"connected","timestamp":"..."}
```

---

## Step 7 — Deploy the Frontend Service

### 7a. Create the service

1. Railway project → **"+ New"** → **"GitHub Repo"** → same repo
2. Configure:
   - **Service Name**: `frontend`
   - **Root Directory**: `store-rating-platform/frontend`
   - **Dockerfile Path**: `Dockerfile`

### 7b. Set frontend environment variables

Go to Frontend service → **"Variables"** tab:

| Variable | Value |
|---|---|
| `NGINX_BACKEND_URL` | `https://your-backend.up.railway.app` *(the URL from Step 6c)* |

> 💡 Do NOT set `PORT` — Railway injects it and Nginx reads it at startup via `envsubst`.

### 7c. Generate a public URL for the frontend

Frontend service → **"Settings"** → **"Networking"** → **"Generate Domain"**

Note the URL, e.g.: `https://store-rating-frontend-production.up.railway.app`

### 7d. Update backend ALLOWED_ORIGINS

Go back to **Backend service** → **"Variables"** → update:

```
ALLOWED_ORIGINS=https://store-rating-frontend-production.up.railway.app
```

Railway will redeploy the backend automatically.

---

## Step 8 — End-to-End Testing

### 8a. Health checks

```bash
# Backend API health
curl https://your-backend.up.railway.app/api/v1/health
# Expected: {"status":"OK","database":"connected","timestamp":"..."}

# Frontend health (nginx lightweight endpoint)
curl https://your-frontend.up.railway.app/health
# Expected: OK
```

### 8b. Application test

1. Open `https://your-frontend.up.railway.app` in a browser
2. Log in with: `admin@store.com` / `Admin@123`
3. Verify the dashboard loads with no network errors (check browser DevTools → Network tab)
4. Create a test store as admin
5. Register a new regular user, log in, and submit a rating

### 8c. CORS test

Open browser DevTools Console on the frontend URL and run:
```javascript
fetch('/api/v1/health').then(r => r.json()).then(console.log)
// Must return {"status":"OK","database":"connected",...}
```

---

## Troubleshooting Guide

### Backend fails to start — "Database connection failed"

**Cause**: Railway variable references not resolving.

**Fix**:
1. Backend service → Variables → verify `DB_HOST` shows `${{MySQL.MYSQLHOST}}`
2. Click the variable — it should show the resolved value
3. Ensure MySQL service is in the **same Railway project**
4. Redeploy the backend

---

### Backend fails to start — "Module not found" / crash

**Cause**: Build failed or wrong Root Directory.

**Fix**:
1. Check Backend service → Build Logs for errors
2. Verify Root Directory is set correctly (e.g., `store-rating-platform/backend`)
3. Ensure `package.json` is in that directory

---

### Frontend shows blank page or "Cannot GET /..."

**Cause**: React Router requires the `try_files` fallback in nginx.

**Fix**: This is already configured in `nginx.conf`. If blank:
1. Check Frontend service → Build Logs
2. Check Deploy Logs for envsubst errors
3. Verify `NGINX_BACKEND_URL` does NOT have a trailing slash

---

### API calls fail from frontend (404 or CORS error)

**Cause 1**: `NGINX_BACKEND_URL` is wrong or missing.

**Fix**: Frontend service → Variables → check `NGINX_BACKEND_URL` equals the exact backend Railway URL with `https://` prefix and no trailing slash. Redeploy frontend.

**Cause 2**: CORS rejection.

**Fix**: Backend service → Variables → `ALLOWED_ORIGINS` must exactly match the frontend URL including `https://` and no trailing slash. Redeploy backend.

---

### "502 Bad Gateway" from Nginx

**Cause**: Frontend is up but backend is unreachable.

**Fix**:
1. Verify backend is healthy: `curl https://your-backend.up.railway.app/api/v1/health`
2. If backend is down: check backend Deploy Logs
3. Verify `NGINX_BACKEND_URL` is the **public** Railway URL (not an internal container name)

---

### "JWT_SECRET not set" or token errors

**Fix**: Backend service → Variables → ensure `JWT_SECRET` is set to a long random string (64+ chars hex). Regenerate if needed:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Schema not applied (tables don't exist)

**Symptom**: Backend crashes with "Table 'Users' doesn't exist".

**Fix**: Re-run Step 5 to apply `database/init.sql` to Railway MySQL.

---

## Redeployment & Updates

Every `git push` to `main` triggers an automatic redeployment of both backend and frontend services. Railway performs zero-downtime rolling deploys.

```bash
# Make changes, commit, push
git add .
git commit -m "fix: your change description"
git push origin main
# Railway auto-deploys both services
```

---

## Environment Variable Summary

### Backend Service

| Variable | Source | Example Value |
|---|---|---|
| `NODE_ENV` | Manual | `production` |
| `DB_HOST` | Railway ref | `${{MySQL.MYSQLHOST}}` |
| `DB_USER` | Railway ref | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | Railway ref | `${{MySQL.MYSQLPASSWORD}}` |
| `DB_NAME` | Railway ref | `${{MySQL.MYSQLDATABASE}}` |
| `DB_PORT` | Railway ref | `${{MySQL.MYSQLPORT}}` |
| `JWT_SECRET` | Manual | `64-char-hex-string` |
| `JWT_EXPIRES_IN` | Manual | `20m` |
| `ALLOWED_ORIGINS` | Manual | `https://frontend.up.railway.app` |
| `PORT` | **Auto (Railway)** | *(do not set)* |

### Frontend Service

| Variable | Source | Example Value |
|---|---|---|
| `NGINX_BACKEND_URL` | Manual | `https://backend.up.railway.app` |
| `PORT` | **Auto (Railway)** | *(do not set)* |

---

## Files Changed (Summary)

| File | Type | Reason |
|---|---|---|
| `backend/app.js` | Modified | CORS updated to respect `ALLOWED_ORIGINS` in production |
| `backend/Dockerfile` | Modified | Added `NODE_ENV=production` default + `HEALTHCHECK` |
| `backend/railway.json` | **New** | Railway service config: Dockerfile path + health check |
| `frontend/nginx.conf` | Modified | `listen ${PORT}` + `proxy_pass ${NGINX_BACKEND_URL}` template vars; added gzip + `/health` endpoint |
| `frontend/Dockerfile` | Modified | Installs `gettext` (envsubst), sets ENV defaults, uses envsubst startup |
| `frontend/railway.json` | **New** | Railway service config: Dockerfile path + health check |
| `database/init.sql` | **New** | Schema without CREATE DATABASE/USE — for Railway's managed MySQL |
| `.env.production.example` | **New** | Documents all Railway env vars with Railway reference syntax |
| `RAILWAY_DEPLOYMENT.md` | **New** | This deployment guide |
| `docker-compose.yml` | ✅ **Untouched** | Local development unchanged |
| `database/schema.sql` | ✅ **Untouched** | Local Docker Compose still uses this |
| `frontend/src/` | ✅ **Untouched** | No React code changes |
| `backend/config/db.js` | ✅ **Untouched** | No business logic changes |
| `backend/server.js` | ✅ **Untouched** | No business logic changes |
