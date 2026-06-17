const db = require('../config/db');

class Rating {
  /**
   * Create a new rating
   */
  static async create({ store_id, user_id, rating }) {
    const query = `
      INSERT INTO Ratings (store_id, user_id, rating)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(query, [store_id, user_id, rating]);
    return result.insertId;
  }

  /**
   * Update an existing rating
   */
  static async update(id, rating) {
    const query = `
      UPDATE Ratings
      SET rating = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [rating, id]);
    return result.affectedRows > 0;
  }

  /**
   * Find a rating by user and store
   */
  static async findByUserAndStore(userId, storeId) {
    const query = `
      SELECT id, store_id, user_id, rating, created_at, updated_at
      FROM Ratings
      WHERE user_id = ? AND store_id = ?
    `;
    const [rows] = await db.execute(query, [userId, storeId]);
    return rows[0];
  }
  
  /**
   * Find a rating by ID
   */
  static async findById(id) {
    const query = `
      SELECT id, store_id, user_id, rating, created_at, updated_at
      FROM Ratings
      WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  /**
   * Get all ratings for a specific user (for My Ratings page)
   */
  static async findByUserId(userId) {
    const query = `
      SELECT 
        r.id, 
        r.rating, 
        r.created_at, 
        r.updated_at,
        s.id AS store_id,
        s.name AS store_name,
        s.address AS store_address
      FROM Ratings r
      JOIN Stores s ON r.store_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.updated_at DESC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  /**
   * Find users who rated a specific store (for Owner Dashboard)
   */
  static async findUsersWhoRatedStore(storeId, { page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const safeLimit = parseInt(limit);
    const safeOffset = parseInt(offset);

    const dataQuery = `
      SELECT 
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        r.rating,
        r.created_at AS rating_date
      FROM Ratings r
      JOIN Users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const countQuery = `
      SELECT COUNT(r.id) AS total
      FROM Ratings r
      WHERE r.store_id = ?
    `;

    const [rows] = await db.query(dataQuery, [storeId]);
    const [countRows] = await db.query(countQuery, [storeId]);

    return {
      rows,
      total: countRows[0]?.total || 0
    };
  }

  /**
   * Get the total count of ratings across all stores
   */
  static async getTotalCount() {
    const query = 'SELECT COUNT(id) AS total FROM Ratings';
    const [rows] = await db.execute(query);
    return rows[0]?.total || 0;
  }
}

module.exports = Rating;
