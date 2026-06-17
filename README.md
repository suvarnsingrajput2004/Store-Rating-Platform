# Store Rating Platform

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![MySQL](https://img.shields.io/badge/MySQL-8-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

A full-stack web application that allows users to rate stores, and store owners to view a comprehensive analytics dashboard of their store's ratings. Designed with modern glassmorphism aesthetics and robust Role-Based Access Control (RBAC).

## 📋 Project Overview

The Store Rating Platform connects local businesses with consumers. It features three distinct user personas:
- **Standard Users**: Can browse stores, view rating distributions, and submit or update their 1-5 star ratings.
- **Store Owners**: Have a dedicated analytics dashboard to monitor their average ratings, highest/lowest rating counts, and see a feed of exactly who rated their store.
- **System Admins**: Have full control over managing users, stores, and platform configuration.

## ✨ Features

- **Role-Based Access Control**: Secure JWT-based authentication with role separation (`ADMIN`, `STORE_OWNER`, `USER`).
- **Interactive Rating System**: Users can submit 1-5 star ratings, with duplicate prevention and ownership enforcement.
- **Owner Analytics Dashboard**: Visual distribution of ratings, total counts, and recent reviews.
- **Admin Management Panel**: Full CRUD capabilities for stores and users, with paginated data tables.
- **Responsive UI**: Built with Material UI (MUI), featuring a custom dark theme and glassmorphic components.
- **Secure Backend**: Express.js REST API with input validation, password hashing (bcrypt), and centralized error handling.

## 🛠 Tech Stack

**Frontend:**
- React.js (Vite)
- Material UI (MUI) v5
- React Router DOM
- Axios
- Recharts (for Dashboard visualizations - if integrated)

**Backend:**
- Node.js & Express.js
- MySQL 8 (mysql2 driver with connection pooling)
- JSON Web Tokens (jsonwebtoken)
- bcryptjs (Password hashing)
- express-validator (Input validation)
- morgan (Request logging)

## 📸 Screenshots
*(Add your screenshots here)*
- `Admin Dashboard`
- `Store Owner Analytics`
- `User Store Listing`
- `Interactive Rating Component`

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)

### 1. Database Setup
1. Create a MySQL database (e.g., `store_rating_platform`).
2. Run the provided schema script or the automatic setup script:
   ```bash
   cd backend
   node scripts/setup-database.js
   ```

### 2. Backend Setup
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file based on `.env.example`.
3. Generate the admin seed hash:
   ```bash
   node scripts/reseed-admin.js
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## 📖 Documentation
For deeper dives into the project structure, API, and deployment, please refer to the `docs/` directory:
- [Architecture & Diagrams](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Testing Report](./docs/TESTING_REPORT.md)

## 🤝 Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this repository.

## 📄 License
This project is licensed under the MIT License.
