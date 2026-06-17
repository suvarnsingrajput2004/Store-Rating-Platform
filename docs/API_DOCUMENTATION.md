# API Documentation

Base URL: `http://localhost:5000/api/v1`

All protected endpoints require an `Authorization` header:
`Authorization: Bearer <your_jwt_token>`

---

## Auth Endpoints

### 1. Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Role Required**: None (Public)
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@test.com",
    "password": "Password@123",
    "address": "123 Main St"
  }
  ```
- **Success Response**: `201 Created`

### 2. Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Role Required**: None (Public)
- **Body**:
  ```json
  {
    "email": "john@test.com",
    "password": "Password@123"
  }
  ```
- **Success Response**: `200 OK` (Returns JWT token and user info)

---

## Admin Endpoints (Requires `ADMIN` role)

### 1. Dashboard Stats
- **URL**: `/admin/dashboard`
- **Method**: `GET`
- **Response**: Aggregated counts for total users, stores, ratings, and latest entities.

### 2. Manage Users
- **URL**: `/admin/users`
- **Method**: `GET`, `POST`
- **Query Params (GET)**: `page`, `limit`, `search`, `sortBy`, `sortOrder`, `role`
- **Body (POST)**: Creates any user role (Admin, Owner, User).

### 3. Manage Stores
- **URL**: `/admin/stores`
- **Method**: `GET`, `POST`
- **Body (POST)**:
  ```json
  {
    "name": "New Store",
    "address": "456 Commerce Blvd",
    "owner_id": 2
  }
  ```

---

## Store Owner Endpoints (Requires `STORE_OWNER` role)

### 1. Owner Dashboard
- **URL**: `/owner/dashboard`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "store": {
        "id": 1,
        "name": "Tech Hub",
        "average_rating": 4.5,
        "total_ratings": 120,
        "ratings_distribution": { "1": 5, "2": 0, "3": 10, "4": 40, "5": 65 }
      },
      "recent_ratings": [ ... ]
    }
  }
  ```

---

## User Endpoints (Requires `USER` role)

### 1. View Stores
- **URL**: `/stores`
- **Method**: `GET`
- **Query Params**: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- **Description**: Returns stores with aggregate rating and the current user's rating.

### 2. Submit Rating
- **URL**: `/ratings`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "store_id": 1,
    "rating": 5
  }
  ```

### 3. Get My Ratings
- **URL**: `/users/my-ratings`
- **Method**: `GET`
- **Description**: Returns all ratings submitted by the logged-in user.

---

## General / System Endpoints

### 1. Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Pings database and returns system status.
