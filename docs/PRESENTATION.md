# Project Presentation & Demo Script

## 1. 5-Minute Demo Script

**[0:00 - 0:30] Introduction**
"Hello, my name is [Your Name], and I built the Store Rating Platform. It's a full-stack web application designed to connect users with local businesses. It allows standard users to explore and rate stores, while providing store owners with a dedicated dashboard to analyze their performance. The stack utilizes React on the frontend, Node.js and Express on the backend, and MySQL for relational data storage."

**[0:30 - 1:30] The Standard User Flow**
"Let's start from the perspective of a standard user. I'll register a new account. As you can see, we have full input validation. Once logged in, I'm redirected to the 'Explore Stores' page. Here, I can see a list of stores. Notice the search bar—it uses a debounce function so it doesn't spam the server while typing. 
Let's click on a store. I see the store's details and its current rating distribution. I can interact with these stars to submit a 4-star rating. The system immediately calculates the new average. If I go to the 'My Ratings' tab, I see a history of all my reviews, and I can edit them directly from here."

**[1:30 - 2:30] The Security & Role Enforcement**
"Security was a major priority. If I take the URL for the Store Owner Dashboard and try to paste it into my browser as a standard user, you'll see I get blocked. This is our Role-Based Access Control in action. The React Router restricts the view, but more importantly, the backend Express middleware intercepts the JWT token, checks my role, and returns a 403 Forbidden error before any data is fetched."

**[2:30 - 3:30] The Store Owner Flow**
"Now, let's log out and log back in as a Store Owner. Upon login, the app recognizes my role and routes me to the Owner Dashboard. Here, I see a high-level analytics view of my specific store. I can see exactly how many ratings I've received, the highest and lowest counts, and a visual distribution of the 1 to 5 stars. Below that, I have a real-time feed of exactly which users rated my store and when."

**[3:30 - 4:30] The Admin Flow**
"Finally, the System Admin. Logging in as Admin gives me access to the management console. Here I can see platform-wide statistics. I have full CRUD access—I can create new stores, assign them to owners, and manage all users on the platform. The tables here use server-side pagination, so even if we have a million users, the frontend only loads 10 at a time, keeping the application lightning fast."

**[4:30 - 5:00] Conclusion**
"Under the hood, all of this is powered by complex SQL `JOIN`s and aggregations to ensure data is calculated at the database level for maximum efficiency. The code is modular, fully tested with a custom test suite, and ready for production deployment. Thank you for your time."

---

## 2. Academic Viva Q&A

**Q: What is the main objective of your project?**
**A:** To provide a reliable, role-based platform where users can submit reviews for stores, and store owners can view aggregated analytics of their customer satisfaction.

**Q: Why did you use React instead of vanilla HTML/JS?**
**A:** React allows for a component-based architecture, making the UI modular and reusable. It handles state changes efficiently through the Virtual DOM, which is essential for dynamic features like the interactive star rating and live search filtering.

**Q: How does the login system work?**
**A:** When a user logs in, the backend checks the email and compares the hashed password using bcrypt. If valid, the server signs a JSON Web Token (JWT) containing the user's ID and Role. The frontend stores this token and attaches it as an `Authorization: Bearer` header on all subsequent API requests.

**Q: How are you calculating the Rating Distribution for the Owner Dashboard?**
**A:** Instead of querying all ratings and counting them in JavaScript, I wrote an optimized SQL query using `SUM(CASE WHEN rating = X THEN 1 ELSE 0 END)`. This tells the MySQL database to aggregate the distribution before sending the data to the Node.js server, making it much faster and more memory-efficient.
