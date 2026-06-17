const db = require('../config/db');

class Store {
  /**
   * Find stores with pagination, search, sorting, and average rating aggregation.
   */
  static async findAndCountAll({ page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
    const offset = (page - 1) * limit;

    // Whitelist sorting columns to prevent SQL injection
    const allowedSortColumns = ['id', 'name', 'address', 'owner_id', 'created_at', 'updated_at', 'average_rating'];
    const activeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const activeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const searchWildcard = `%${search}%`;
    // Inline LIMIT/OFFSET as integers to avoid prepared-statement protocol limitation
    const safeLimit  = parseInt(limit);
    const safeOffset = parseInt(offset);

    // 1. Get paginated results — use query() (text protocol) to allow inlined LIMIT/OFFSET
    const dataQuery = `
      SELECT 
        s.id, 
        s.name, 
        s.address, 
        s.owner_id, 
        s.created_at, 
        s.updated_at,
        u.name AS owner_name, 
        u.email AS owner_email,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM Stores s
      LEFT JOIN Users u ON s.owner_id = u.id
      LEFT JOIN Ratings r ON s.id = r.store_id
      WHERE s.name LIKE ? OR s.address LIKE ? OR u.name LIKE ?
      GROUP BY s.id, u.id
      ORDER BY ${activeSortBy === 'average_rating' ? 'average_rating' : `s.${activeSortBy}`} ${activeSortOrder}
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    // 2. Get total matching count
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) AS total
      FROM Stores s
      LEFT JOIN Users u ON s.owner_id = u.id
      WHERE s.name LIKE ? OR s.address LIKE ? OR u.name LIKE ?
    `;

    const [rows]      = await db.query(dataQuery,  [searchWildcard, searchWildcard, searchWildcard]);
    const [countRows] = await db.query(countQuery, [searchWildcard, searchWildcard, searchWildcard]);

    const total = countRows[0]?.total || 0;

    // Format average_rating to number
    const formattedRows = rows.map(row => ({
      ...row,
      average_rating: parseFloat(parseFloat(row.average_rating).toFixed(2))
    }));

    return { rows: formattedRows, total };
  }

  /**
   * Find a specific store by ID with average rating, nested owner object, and rating distribution.
   */
  static async findById(id) {
    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.address, 
        s.owner_id, 
        s.created_at, 
        s.updated_at,
        u.id   AS owner_id_val,
        u.name AS owner_name, 
        u.email AS owner_email,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM Stores s
      LEFT JOIN Users u ON s.owner_id = u.id
      LEFT JOIN Ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id, u.id
    `;
    const [rows] = await db.execute(query, [id]);
    if (!rows[0]) return null;

    const row = rows[0];

    // Rating distribution breakdown: count per star value 1-5
    const distQuery = `
      SELECT rating, COUNT(*) AS count
      FROM Ratings
      WHERE store_id = ?
      GROUP BY rating
    `;
    const [distRows] = await db.execute(distQuery, [id]);
    const ratings_distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distRows.forEach(({ rating, count }) => {
      ratings_distribution[rating] = parseInt(count);
    });

    return {
      id: row.id,
      name: row.name,
      address: row.address,
      owner_id: row.owner_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      average_rating: parseFloat(parseFloat(row.average_rating).toFixed(2)),
      total_ratings: parseInt(row.total_ratings),
      ratings_distribution,
      owner: row.owner_id
        ? { id: row.owner_id_val, name: row.owner_name, email: row.owner_email }
        : null
    };
  }

  /**
   * Create a new store
   */
  static async create({ name, address, owner_id = null }) {
    // If owner_id is an empty string, set to null
    const finalOwnerId = owner_id === '' || owner_id === null ? null : owner_id;

    const query = `
      INSERT INTO Stores (name, address, owner_id)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(query, [name, address, finalOwnerId]);
    return this.findById(result.insertId);
  }

  /**
   * Update store metadata
   */
  static async update(id, { name, address, owner_id = null }) {
    const finalOwnerId = owner_id === '' || owner_id === null ? null : owner_id;

    const query = `
      UPDATE Stores
      SET name = ?, address = ?, owner_id = ?
      WHERE id = ?
    `;
    await db.execute(query, [name, address, finalOwnerId, id]);
    return this.findById(id);
  }

  /**
   * Delete a store by ID
   */
  static async delete(id) {
    const query = 'DELETE FROM Stores WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Retrieve latest 5 stores (for admin dashboard stats)
   */
  static async findLatest(limit = 5) {
    const safeLimit = parseInt(limit);
    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.address, 
        s.created_at,
        COALESCE(AVG(r.rating), 0) AS average_rating
      FROM Stores s
      LEFT JOIN Ratings r ON s.id = r.store_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT ${safeLimit}
    `;
    const [rows] = await db.query(query);
    return rows.map(row => ({
      ...row,
      average_rating: parseFloat(parseFloat(row.average_rating).toFixed(2))
    }));
  }

  /**
   * Find stores with pagination, search, sorting, and user-specific rating.
   */
  static async findStoresForUser({ page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' }, userId) {
    const offset = (page - 1) * limit;

    const allowedSortColumns = ['id', 'name', 'address', 'created_at', 'average_rating'];
    const activeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const activeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const searchWildcard = `%${search}%`;
    const safeLimit = parseInt(limit);
    const safeOffset = parseInt(offset);

    const dataQuery = `
      SELECT 
        s.id, 
        s.name, 
        s.address, 
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS total_ratings,
        ur.rating AS my_rating
      FROM Stores s
      LEFT JOIN Ratings r ON s.id = r.store_id
      LEFT JOIN Ratings ur ON s.id = ur.store_id AND ur.user_id = ?
      WHERE s.name LIKE ? OR s.address LIKE ?
      GROUP BY s.id, ur.rating
      ORDER BY ${activeSortBy === 'average_rating' ? 'average_rating' : `s.${activeSortBy}`} ${activeSortOrder}
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT s.id) AS total
      FROM Stores s
      WHERE s.name LIKE ? OR s.address LIKE ?
    `;

    const [rows] = await db.query(dataQuery, [userId, searchWildcard, searchWildcard]);
    const [countRows] = await db.query(countQuery, [searchWildcard, searchWildcard]);

    const total = countRows[0]?.total || 0;

    const formattedRows = rows.map(row => ({
      ...row,
      average_rating: parseFloat(parseFloat(row.average_rating).toFixed(2))
    }));

    return { rows: formattedRows, total };
  }

  /**
   * Find a store by owner ID including rating distribution and analytics.
   */
  static async findByOwnerId(ownerId) {
    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.address, 
        s.created_at,
        s.updated_at,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS total_ratings,
        SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS rating_1,
        SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS rating_2,
        SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS rating_3,
        SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS rating_4,
        SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS rating_5
      FROM Stores s
      LEFT JOIN Ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `;
    
    const [rows] = await db.execute(query, [ownerId]);
    if (rows.length === 0) return null;

    const row = rows[0];
    
    // Find highest and lowest rating counts
    const distribution = {
      1: parseInt(row.rating_1 || 0),
      2: parseInt(row.rating_2 || 0),
      3: parseInt(row.rating_3 || 0),
      4: parseInt(row.rating_4 || 0),
      5: parseInt(row.rating_5 || 0)
    };
    
    const maxCount = Math.max(...Object.values(distribution));
    const minCount = Math.min(...Object.values(distribution));

    return {
      id: row.id,
      name: row.name,
      address: row.address,
      created_at: row.created_at,
      updated_at: row.updated_at,
      average_rating: parseFloat(parseFloat(row.average_rating).toFixed(2)),
      total_ratings: parseInt(row.total_ratings),
      ratings_distribution: distribution,
      highest_rating_count: maxCount,
      lowest_rating_count: minCount
    };
  }
}

module.exports = Store;
