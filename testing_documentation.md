# Store Rating Platform - Phase 1 Testing & Verification Documentation

This document compiles the comprehensive testing suite for Phase 1 of the **Store Rating Platform**. It includes a Postman collection JSON, curl requests and responses, SQL checking queries, a manual testing checklist, and a bug checklist.

---

## 📬 1. Postman Collection (v2.1 JSON)

Copy this JSON and save it as `Store_Rating_Phase_1.postman_collection.json` to import it directly into Postman.

```json
{
  "info": {
    "_postman_id": "8c42b5a1-7c98-4c8d-bdcd-0814407ab6cc",
    "name": "Store Rating Platform - Phase 1",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Jonathan Alexander Doe\",\n  \"email\": \"jonathan.doe@example.com\",\n  \"password\": \"SecurePass@123\",\n  \"role\": \"USER\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{BASE_URL}}/auth/register",
              "host": [
                "{{BASE_URL}}"
              ],
              "path": [
                "auth",
                "register"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Login User",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"jonathan.doe@example.com\",\n  \"password\": \"SecurePass@123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{BASE_URL}}/auth/login",
              "host": [
                "{{BASE_URL}}"
              ],
              "path": [
                "auth",
                "login"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Logout User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{JWT_TOKEN}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{BASE_URL}}/auth/logout",
              "host": [
                "{{BASE_URL}}"
              ],
              "path": [
                "auth",
                "logout"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{JWT_TOKEN}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{BASE_URL}}/users/profile",
              "host": [
                "{{BASE_URL}}"
              ],
              "path": [
                "users",
                "profile"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Change Password",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{JWT_TOKEN}}",
                "type": "text"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"oldPassword\": \"SecurePass@123\",\n  \"newPassword\": \"NewSecurePass@321\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{BASE_URL}}/users/change-password",
              "host": [
                "{{BASE_URL}}"
              ],
              "path": [
                "users",
                "change-password"
              ]
            }
          },
          "response": []
        }
      ]
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "exec": [
          ""
        ]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          ""
        ]
      }
    }
  ],
  "variable": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:5000/api/v1",
      "type": "string"
    },
    {
      "key": "JWT_TOKEN",
      "value": "your_token_here",
      "type": "string"
    }
  ]
}
```

---

## 💻 2. Sample API Requests & Responses (curl)

### A. Register User
**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jonathan Alexander Doe",
    "email": "jonathan.doe@example.com",
    "password": "SecurePass@123",
    "role": "USER"
  }'
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": 2,
      "name": "Jonathan Alexander Doe",
      "email": "jonathan.doe@example.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImpvbmF0aGFuLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTc4MTcxNzE5MiwiZXhwIjoxNzgxOTc2MzkyfQ..."
  }
}
```

### B. Login User
**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jonathan.doe@example.com",
    "password": "SecurePass@123"
  }'
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 2,
      "name": "Jonathan Alexander Doe",
      "email": "jonathan.doe@example.com",
      "role": "USER",
      "created_at": "2026-06-17T17:45:00.000Z",
      "updated_at": "2026-06-17T17:45:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImpvbmF0aGFuLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTc4MTcxNzE5MiwiZXhwIjoxNzgxOTc2MzkyfQ..."
  }
}
```

### C. Get User Profile (Protected)
**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer <insert_token_here>"
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Jonathan Alexander Doe",
    "email": "jonathan.doe@example.com",
    "role": "USER",
    "created_at": "2026-06-17T17:45:00.000Z",
    "updated_at": "2026-06-17T17:45:00.000Z"
  }
}
```

### D. Change Password (Protected)
**Request:**
```bash
curl -X PUT http://localhost:5000/api/v1/users/change-password \
  -H "Authorization: Bearer <insert_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "SecurePass@123",
    "newPassword": "NewSecurePass@321"
  }'
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

---

## 🛢️ 3. SQL Verification Queries

Run these queries inside your MySQL client (e.g. MySQL Workbench, phpMyAdmin) to verify database status:

```sql
-- Select all users to verify registrations and roles
SELECT id, name, email, role, created_at, updated_at FROM Users;

-- Find specific user by email
SELECT * FROM Users WHERE email = 'admin@store.com';

-- List indexes on all tables
SHOW INDEX FROM Users;
SHOW INDEX FROM Stores;
SHOW INDEX FROM Ratings;

-- List foreign key constraints
SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'store_rating_db' AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

## 📋 4. Manual Testing Checklist (Frontend UI)

| Step | Action | Expected Behavior | Status |
|---|---|---|---|
| 1 | Navigate to `http://localhost:3000` | Redirects automatically to `/login` since user is unauthenticated. | [ ] |
| 2 | Submit Login Form without inputs | Red validation text appears stating email and password are required. | [ ] |
| 3 | Input invalid email form | "Please enter a valid email address." helper text displays. | [ ] |
| 4 | Click "Register" link | App routes smoothly to `/register` without reloading page. | [ ] |
| 5 | Submit Register Form with name `< 20` chars | Name warning is displayed: "Name must be between 20 and 60 characters." | [ ] |
| 6 | Submit Register with invalid password | Password rule warning shows: "Password must contain at least 1 uppercase and 1 special character." | [ ] |
| 7 | Create a valid `USER` account | Registration completes; page redirects instantly to `/stores` view (placeholder). | [ ] |
| 8 | Refresh page on `/stores` | Page loads instantly, user remains logged in (JWT persisted in localStorage). | [ ] |
| 9 | Click Avatar -> My Profile | Displays profile details grid containing Name, Email, Role, Member Date. | [ ] |
| 10 | Click Avatar -> Change Password | Displays password fields. Validates and submits successfully. | [ ] |
| 11 | Click Avatar -> Logout | Clears token from localStorage and redirects back to `/login`. | [ ] |
| 12 | Attempt to visit `/admin/dashboard` as USER | Blocked by ProtectedRoute, redirects to `/unauthorized`. | [ ] |

---

## 🐞 5. Bug Checklist (Operational & Security Verification)

- [ ] **SQL Injection:** SQL queries in `User.js` must use prepared statement placeholders `?` rather than raw string concatenation. (VERIFIED: Prepared statement placeholders are used).
- [ ] **State Poisoning / Tampering:** JWT token payload values (`id`, `role`) must be verified on each request. Users must not be allowed to manipulate other user profiles. (VERIFIED: User ID is retrieved from token payload `req.user.id`).
- [ ] **Database Connection Leakage:** Connection releases must run inside the `finally` block of controllers/models to return connections to the pool. (VERIFIED: Connection pool managed automatically by `db.execute` which opens/closes connection per query).
- [ ] **Input Sanitization:** Express Validator `trim()` and `normalizeEmail()` must be applied to prevent HTML injection and normalization errors. (VERIFIED: Input trim sanitizers applied in `authValidator.js`).
