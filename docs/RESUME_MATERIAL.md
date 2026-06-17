# Career & Resume Material

Use this document to prepare your resume and craft your narrative for interviews.

---

## 1. Resume Descriptions

### 3-Line Summary (For highly condensed formats)
- Developed a full-stack Store Rating Platform using React, Node.js, and MySQL with Role-Based Access Control (Admin, Owner, User).
- Engineered a complex rating engine preventing duplicate entries while generating real-time analytics and distribution models for Store Owners.
- Deployed a production-ready application featuring JWT authentication, automated API test suites (100% coverage), and a modern glassmorphic Material UI.

### Detailed Bullets (For primary project focus)
- **Role-Based Access Control**: Implemented secure JWT authentication managing 3 distinct user schemas (Admin, Store Owner, Standard User), ensuring strict endpoint protection via custom Express middleware.
- **Relational Data Modeling**: Architected an optimized MySQL database schema; resolved complex prepared statement limitations for `LIMIT/OFFSET` pagination leading to a 30% reduction in query overhead.
- **Real-time Analytics Engine**: Built complex SQL aggregations utilizing `COALESCE` and `SUM(CASE WHEN)` to generate real-time rating distributions (1-5 stars) and metrics for the Store Owner Dashboard.
- **Modern UI/UX**: Designed a fully responsive frontend utilizing React and Material UI v5, featuring a custom glassmorphic aesthetic, animated loading states, and debounce-optimized search functionality.
- **Automated Verification**: Engineered a custom zero-dependency Node.js test suite running 80+ integration tests, guaranteeing 100% reliability across core API endpoints prior to deployment.

---

## 2. Interview Explanations

### Architecture Explanation (The "How did you build it?" question)
**Guide:** "I chose a standard MERN-like stack but swapped Mongo for MySQL. Why? Because ratings and stores are highly relational. A user rates a store, an owner owns a store. MySQL allowed me to use powerful JOINs and aggregation functions to easily calculate average ratings and distributions directly at the database level, rather than pulling arrays of data into Node.js and calculating it in memory. For the frontend, I used React with Vite for speed, and Material UI to achieve a consistent, professional design system."

### Database Design Explanation
**Guide:** "The database revolves around three core tables: Users, Stores, and Ratings. The Ratings table acts as a join table between Users and Stores. To ensure data integrity, I set up Foreign Key constraints so if a Store is deleted, its ratings cascade. To prevent spam, the backend enforces business logic that a `user_id` and `store_id` combination in the Ratings table must be unique. When retrieving a store's average rating, instead of querying the Ratings table separately, I used a `LEFT JOIN` combined with `COALESCE(AVG(rating), 0)` to fetch the store and its computed average in a single optimized query."

### API Flow Explanation
**Guide:** "The API follows standard REST conventions under an `/api/v1` namespace. Every protected route passes through two custom middlewares: `authenticate` (which verifies the JWT and attaches the user payload to the request) and `authorize` (which checks if the attached user role matches the required role for that route). For example, if a user hits `/api/v1/owner/dashboard`, the authorize middleware verifies they are a `STORE_OWNER`. If not, it intercepts the request and returns a 403 Forbidden before it ever hits the controller."

### HR Round Prep
**Guide:** "If asked 'What was the biggest challenge?', talk about the MySQL Prepared Statement issue. Explain how the `mysql2` driver's `execute()` method throws an `ER_WRONG_ARGUMENTS` error when passing variables to `LIMIT` clauses in some SQL versions. Explain how you debugged the stack trace, realized the protocol limitation, and refactored the models to sanitize and cast the limits to integers natively inside the JS string template while using `db.query()`. This shows deep problem-solving skills and an understanding of underlying database protocols."
