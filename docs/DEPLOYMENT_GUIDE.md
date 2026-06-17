# Deployment Guide

This guide covers deploying the Store Rating Platform across standard cloud providers: Vercel (Frontend), Render (Backend), and Railway (Database).

## 1. Database Deployment (Railway MySQL)
Railway provides an easy 1-click MySQL database.

1. Go to [Railway.app](https://railway.app/).
2. Create a New Project -> Provision MySQL.
3. Wait for the database to spin up.
4. Click on the MySQL service -> Go to **Variables**.
5. Note down the `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, and `MYSQL_PORT`.
6. You will use these for your Backend `.env`.

## 2. Backend Deployment (Render)
Render acts as our cloud hosting provider for the Node.js API.

1. Go to [Render.com](https://render.com/).
2. Click **New Web Service** and connect your GitHub repo.
3. Select the `backend` folder as your root directory (or specify in settings).
4. Configure the service:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Go to **Environment Variables** and add:
   - `PORT`: `10000` (Render defaults to this)
   - `NODE_ENV`: `production`
   - `DB_HOST`: `<Your Railway MySQL Host>`
   - `DB_USER`: `<Your Railway MySQL User>`
   - `DB_PASSWORD`: `<Your Railway MySQL Password>` (Enclose in quotes if it has `#`)
   - `DB_NAME`: `<Your Railway MySQL Database>`
   - `JWT_SECRET`: `generate_a_secure_random_string`
6. Click **Deploy**. Note the resulting URL (e.g., `https://my-backend.onrender.com`).

## 3. Frontend Deployment (Vercel)
Vercel hosts the React Vite application.

1. Go to [Vercel.com](https://vercel.com/).
2. Click **Add New Project** and import your GitHub repo.
3. Set the **Framework Preset** to Vite.
4. Set the **Root Directory** to `frontend`.
5. Go to **Environment Variables** and add:
   - Name: `VITE_API_URL`
   - Value: `https://my-backend.onrender.com/api/v1` (Replace with your actual Render URL).
   *(Note: You'll need to update `frontend/src/services/*.js` to use `import.meta.env.VITE_API_URL` instead of the hardcoded localhost).*
6. Click **Deploy**.

## Troubleshooting Deployment

**Backend Error: Connection Refused**
- Ensure Railway database URL/credentials exactly match what is in Render environment variables.
- Ensure the database is awake (Railway sleeps free tier DBs after inactivity).

**Frontend CORS Errors**
- Update the backend `app.js` CORS configuration to specifically allow your Vercel URL origin instead of just `app.use(cors())`.

**MySQL ER_WRONG_ARGUMENTS**
- Ensure you are running MySQL 8+. Older MySQL 5.7 engines sometimes reject prepared statement pagination (`LIMIT ?`). The codebase has been refactored to handle this natively, but keep engines updated.
