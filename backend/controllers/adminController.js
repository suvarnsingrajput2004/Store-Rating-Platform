const AdminService = require('../services/adminService');

class AdminController {
  /**
   * Get overall admin dashboard statistics
   */
  static async getDashboardStats(req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }

  // --- USER CONTROLLER METHODS ---

  /**
   * Get list of users (paginated, sorted, searched, filtered)
   */
  static async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC', role = '' } = req.query;
      
      const result = await AdminService.getUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder,
        role
      });

      res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / parseInt(limit))
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single user profile details
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserById(id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Add a new user
   */
  static async createUser(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const user = await AdminService.createUser({ name, email, password, role });
      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update an existing user
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      const user = await AdminService.updateUser(id, { name, email, role });
      res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteUser(id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }

  // --- STORE CONTROLLER METHODS ---

  /**
   * Get list of stores (paginated, sorted, searched)
   */
  static async getStores(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

      const result = await AdminService.getStores({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder
      });

      res.status(200).json({
        success: true,
        data: result.rows,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / parseInt(limit))
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single store profile details
   */
  static async getStoreById(req, res, next) {
    try {
      const { id } = req.params;
      const store = await AdminService.getStoreById(id);
      res.status(200).json({
        success: true,
        data: store
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Add a new store
   */
  static async createStore(req, res, next) {
    try {
      const { name, address, owner_id } = req.body;
      const store = await AdminService.createStore({ name, address, owner_id });
      res.status(201).json({
        success: true,
        message: 'Store created successfully.',
        data: store
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update store metadata
   */
  static async updateStore(req, res, next) {
    try {
      const { id } = req.params;
      const { name, address, owner_id } = req.body;
      const store = await AdminService.updateStore(id, { name, address, owner_id });
      res.status(200).json({
        success: true,
        message: 'Store updated successfully.',
        data: store
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a store
   */
  static async deleteStore(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteStore(id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
