const db = require('../config/db');

class User {
  /**
   * Create a new user in the database
   */
  static async create({ name, email, password, role = 'USER' }) {
    const query = `
      INSERT INTO Users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [name, email, password, role]);
    return { id: result.insertId, name, email, role };
  }

  /**
   * Find a user by their email address
   */
  static async findByEmail(email) {
    const query = `
      SELECT id, name, email, password, role, created_at, updated_at
      FROM Users
      WHERE email = ?
    `;
    const [rows] = await db.execute(query, [email]);
    return rows[0] || null;
  }

  /**
   * Find a user by their primary key ID
   */
  static async findById(id) {
    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM Users
      WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Find a user by ID and attach store details if they are a Store Owner.
   */
  static async findByIdWithStore(id) {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.created_at, 
        u.updated_at,
        s.id AS store_id, 
        s.name AS store_name,
        s.address AS store_address,
        COALESCE(AVG(r.rating), 0) AS store_average_rating
      FROM Users u
      LEFT JOIN Stores s ON u.id = s.owner_id
      LEFT JOIN Ratings r ON s.id = r.store_id
      WHERE u.id = ?
      GROUP BY u.id, s.id, s.name, s.address
    `;
    const [rows] = await db.execute(query, [id]);
    if (!rows[0]) return null;

    const profile = rows[0];
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      store: profile.store_id ? {
        id: profile.store_id,
        name: profile.store_name,
        address: profile.store_address,
        average_rating: parseFloat(parseFloat(profile.store_average_rating).toFixed(2))
      } : null
    };
  }

  /**
   * Retrieve users with pagination, sorting, search (name, email), and role filtering.
   */
  static async findAndCountAll({ page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC', role = '' }) {
    const offset = (page - 1) * limit;

    // Whitelist sorting columns to prevent SQL injection
    const allowedSortColumns = ['id', 'name', 'email', 'role', 'created_at', 'updated_at'];
    const activeSortBy    = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const activeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const searchWildcard = `%${search}%`;
    // Inline LIMIT/OFFSET as integers to avoid prepared-statement protocol limitation
    const safeLimit  = parseInt(limit);
    const safeOffset = parseInt(offset);

    let dataQuery = `
      SELECT id, name, email, role, created_at, updated_at
      FROM Users
      WHERE (name LIKE ? OR email LIKE ?)
    `;

    let countQuery = `
      SELECT COUNT(id) AS total
      FROM Users
      WHERE (name LIKE ? OR email LIKE ?)
    `;

    const queryParams = [searchWildcard, searchWildcard];

    // Append role filter if specified
    if (role && ['USER', 'STORE_OWNER', 'ADMIN'].includes(role.toUpperCase())) {
      dataQuery  += ' AND role = ?';
      countQuery += ' AND role = ?';
      queryParams.push(role.toUpperCase());
    }

    // Inline LIMIT/OFFSET — use db.query() (text protocol) instead of execute()
    dataQuery += `
      ORDER BY ${activeSortBy} ${activeSortOrder}
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rows]      = await db.query(dataQuery,  queryParams);
    const [countRows] = await db.query(countQuery, queryParams);

    return { rows, total: countRows[0]?.total || 0 };
  }

  /**
   * Retrieve latest registered users
   */
  static async findLatest(limit = 5) {
    const safeLimit = parseInt(limit);
    const query = `
      SELECT id, name, email, role, created_at
      FROM Users
      ORDER BY created_at DESC
      LIMIT ${safeLimit}
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  /**
   * Get the password hash of a user by ID
   */
  static async getPasswordHash(id) {
    const query = `
      SELECT password
      FROM Users
      WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] ? rows[0].password : null;
  }

  /**
   * Update user's password
   */
  static async updatePassword(id, hashedPassword) {
    const query = `
      UPDATE Users
      SET password = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [hashedPassword, id]);
    return result.affectedRows > 0;
  }

  /**
   * Update user details (admin capability)
   */
  static async update(id, { name, email, role }) {
    const query = `
      UPDATE Users
      SET name = ?, email = ?, role = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [name, email, role, id]);
    return result.affectedRows > 0;
  }

  /**
   * Delete a user by ID
   */
  static async delete(id) {
    const query = 'DELETE FROM Users WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Get total user count
   */
  static async getTotalCount() {
    const query = 'SELECT COUNT(id) AS total FROM Users';
    const [rows] = await db.execute(query);
    return rows[0]?.total || 0;
  }
}

module.exports = User;
