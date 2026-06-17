# Store Rating Platform - Interview Questions

A comprehensive list of 30+ technical questions an interviewer might ask based on this project.

## Authentication & Security
1. Why did you choose JWT over Session Cookies for this project?
2. Explain the difference between `authenticate` and `authorize` in your middleware.
3. How are you storing the JWT on the frontend? What are the security risks of storing it in `localStorage` vs `HttpOnly` cookies?
4. How does `bcrypt` work? Why is it better than standard SHA-256 hashing?
5. How did you prevent a user from rating a store multiple times?
6. If an attacker intercepts a JWT, how can they use it, and how can we mitigate that risk?
7. Explain how Role-Based Access Control (RBAC) is enforced on both the frontend (React Router) and the backend (Express).

## Database & MySQL
8. Why did you choose MySQL over a NoSQL database like MongoDB for this specific project?
9. Explain the relationships between your Users, Stores, and Ratings tables.
10. What is a Foreign Key constraint? How did you use it?
11. How did you calculate the average rating for a store? Explain the SQL query.
12. You encountered an `ER_WRONG_ARGUMENTS` error with MySQL Prepared Statements regarding the `LIMIT` clause. Can you explain why that happened and how you fixed it?
13. Explain the difference between `db.query()` and `db.execute()` in the `mysql2` package.
14. How did you calculate the "Rating Distribution" (e.g., how many 5 stars, 4 stars) efficiently?
15. What is the purpose of `COALESCE` in your SQL queries?

## Backend & Node.js
16. What is the purpose of `express-validator`? Why validate on the backend when the frontend already has HTML5 validation?
17. How does your centralized Error Handling middleware work?
18. Why do we hide the error `stack` trace in production environments?
19. Explain how you structured your backend files (Routes -> Controllers -> Services -> Models). Why use this layered architecture?
20. What does `morgan` do in your application?
21. How do you handle pagination in your API?

## Frontend & React
22. How did you manage global state for the authenticated user in React? (e.g., Context API vs Redux).
23. Explain how React Router's `Outlet` and your `<ProtectedRoute>` component work together.
24. What are Axios Interceptors? How did you use them to attach the JWT token to requests?
25. How did you implement the "Debounce" feature for the search bar? Why is debouncing important?
26. Describe how you built the interactive 1-5 Star Rating component.
27. Why did you use Material UI (MUI)? What are the pros and cons compared to TailwindCSS?

## System Design & Deployment
28. Explain the deployment architecture. Where does the Database live? Where does the API live?
29. What are Environment Variables (`.env`)? Why do we keep them out of GitHub?
30. How would you scale this application if it suddenly got 1 million users?
31. What is the purpose of the `/health` endpoint?

## Behavioral / General
32. What was the most challenging part of building this application?
33. If you had 2 more weeks to work on this, what features would you add next?
34. Walk me through how you debug a failing API request.
