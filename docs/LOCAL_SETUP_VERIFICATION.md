# Local Setup Verification Checklist

Use this guide to verify that the Store Rating Platform runs successfully on your local machine from scratch.

---

## 1. Project Initialization

### Install Dependencies
Open your terminal and install all required node modules for both the frontend and backend.

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 2. Environment Variables

Create the required `.env` file in the `backend` folder.

```bash
cd backend
# On Windows PowerShell
cp .env.example .env
```

**Verify `backend/.env` contents:**
Ensure these values match your local MySQL configuration.
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
# Put your MySQL password here:
DB_PASSWORD="your_database_password" 
DB_NAME=store_rating_platform
JWT_SECRET=my_super_secret_jwt_key_123
JWT_EXPIRES_IN=24h
```

---

## 3. Database Setup

Ensure your local MySQL server is running. Then run the automated database setup script.

```bash
cd backend
node scripts/setup-database.js
```
*Expected Output:* You should see success messages confirming that the database `store_rating_platform` and all tables (`Users`, `Stores`, `Ratings`) were created.

Run the admin seeding script:
```bash
node scripts/reseed-admin.js
```
*Expected Output:* "Admin user successfully created/updated."

---

## 4. Backend Verification

Start the backend server.

```bash
cd backend
npm run dev
```
*Expected Output:*
```text
Server running on port 5000 in development mode
MySQL Database connected successfully!
```

**Verify API Health**
Open a browser or use a tool like cURL or Postman to hit the health endpoint:
```bash
curl http://localhost:5000/api/v1/health
```
*Expected Output:* `{"status":"OK","database":"connected","timestamp":"..."}`

---

## 5. Frontend Verification

Open a new terminal window and start the frontend React server.

```bash
cd frontend
npm run dev
```
*Expected Output:*
```text
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

**Verify UI**
1. Open `http://localhost:5173` in your browser.
2. You should see the landing/login page.
3. Login using the Admin credentials:
   - Email: `admin@store.com`
   - Password: `Admin@123`
4. You should be redirected to the **Admin Dashboard**.

---

## 6. Automated Testing Verification (Optional but Recommended)

Stop the backend server (Ctrl+C), then run the test suites to ensure all business logic is intact.

```bash
cd backend
node scripts/test-phase1-apis.js
node scripts/test-phase2-apis.js
node scripts/test-phase3-apis.js
```
*Expected Output:* Each script should end with a summary table showing 100% Passed.

---

## 7. Common Errors and Fixes

### 1. `ER_ACCESS_DENIED_ERROR`
* **Symptom:** Backend crashes on startup with access denied.
* **Fix:** Double-check your `DB_USER` and `DB_PASSWORD` in `backend/.env`. If your password contains special characters (like `#` or `!`), enclose it in double quotes (`"My#Password"`).

### 2. `ECONNREFUSED 127.0.0.1:3306`
* **Symptom:** Backend crashes on startup or health endpoint says database disconnected.
* **Fix:** Your MySQL server is not running. Start it via XAMPP, MySQL Workbench, or Windows Services.

### 3. `CORS Error` in Browser Console
* **Symptom:** Frontend UI fails to log in, console shows CORS policy block.
* **Fix:** Ensure the backend is actually running on port 5000. If your backend started on a different port (e.g., 5001), update `frontend/src/services/api.js` to point to the correct port.

### 4. `ER_WRONG_ARGUMENTS: Incorrect arguments to mysqld_stmt_execute`
* **Symptom:** Admin dashboard or Store listing fails to load.
* **Fix:** This is a known issue with older MySQL versions and the `mysql2` driver regarding `LIMIT ?`. The code is already written to handle this, but if you modified the `Store.js` or `User.js` models, ensure you use `db.query()` with integer parsing instead of `db.execute()` for pagination queries.
