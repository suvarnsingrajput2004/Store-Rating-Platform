const bcrypt = require('bcryptjs');
const db = require('../config/db');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');

class AdminService {
  /**
   * Fetch aggregate data and latest items for dashboard widgets
   */
  static async getDashboardStats() {
    const [userCountRows] = await db.execute('SELECT COUNT(id) AS total FROM Users');
    const storeCountRows = await db.execute('SELECT COUNT(id) AS total FROM Stores');
    const totalRatings = await Rating.getTotalCount();
    
    const latestUsers = await User.findLatest(5);
    const latestStores = await Store.findLatest(5);

    const totalUsers = userCountRows[0]?.total || 0;
    const totalStores = storeCountRows[0][0]?.total || 0; // db.execute returns nested arrays [rows, fields]

    return {
      stats: {
        totalUsers,
        totalStores,
        totalRatings
      },
      latestUsers,
      latestStores
    };
  }

  // --- USER CRUD SERVICE WRAPPERS ---

  static async getUsers(params) {
    return await User.findAndCountAll(params);
  }

  static async getUserById(id) {
    const user = await User.findByIdWithStore(id);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  static async createUser({ name, email, password, role }) {
    // Check email collision
    const existing = await User.findByEmail(email);
    if (existing) {
      const error = new Error('Email is already in use.');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });
  }

  static async updateUser(id, { name, email, role }) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check email collision with other users
    const existing = await User.findByEmail(email);
    if (existing && existing.id !== parseInt(id)) {
      const error = new Error('Email is already in use by another user.');
      error.statusCode = 400;
      throw error;
    }

    const updated = await User.update(id, { name, email, role });
    if (!updated) {
      const error = new Error('Failed to update user.');
      error.statusCode = 500;
      throw error;
    }

    return await User.findByIdWithStore(id);
  }

  static async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const deleted = await User.delete(id);
    if (!deleted) {
      const error = new Error('Failed to delete user.');
      error.statusCode = 500;
      throw error;
    }

    return { success: true, message: 'User deleted successfully.' };
  }

  // --- STORE CRUD SERVICE WRAPPERS ---

  static async getStores(params) {
    return await Store.findAndCountAll(params);
  }

  static async getStoreById(id) {
    const store = await Store.findById(id);
    if (!store) {
      const error = new Error('Store not found.');
      error.statusCode = 404;
      throw error;
    }
    return store;
  }

  static async createStore({ name, address, owner_id }) {
    // If owner_id is specified, verify it matches a valid user (and typically a STORE_OWNER, though we can allow flexibility)
    if (owner_id) {
      const user = await User.findById(owner_id);
      if (!user) {
        const error = new Error('Selected owner user does not exist.');
        error.statusCode = 400;
        throw error;
      }
    }

    return await Store.create({ name, address, owner_id });
  }

  static async updateStore(id, { name, address, owner_id }) {
    const store = await Store.findById(id);
    if (!store) {
      const error = new Error('Store not found.');
      error.statusCode = 404;
      throw error;
    }

    if (owner_id) {
      const user = await User.findById(owner_id);
      if (!user) {
        const error = new Error('Selected owner user does not exist.');
        error.statusCode = 400;
        throw error;
      }
    }

    return await Store.update(id, { name, address, owner_id });
  }

  static async deleteStore(id) {
    const store = await Store.findById(id);
    if (!store) {
      const error = new Error('Store not found.');
      error.statusCode = 404;
      throw error;
    }

    const deleted = await Store.delete(id);
    if (!deleted) {
      const error = new Error('Failed to delete store.');
      error.statusCode = 500;
      throw error;
    }

    return { success: true, message: 'Store deleted successfully.' };
  }
}

module.exports = AdminService;
