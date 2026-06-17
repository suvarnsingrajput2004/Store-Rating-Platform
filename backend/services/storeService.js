const Store = require('../models/Store');

class StoreService {
  static async getStoresForUser(params, userId) {
    return await Store.findStoresForUser(params, userId);
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
}

module.exports = StoreService;
