const Store = require('../models/Store');
const Rating = require('../models/Rating');

class OwnerService {
  static async getDashboard(ownerId) {
    const store = await Store.findByOwnerId(ownerId);
    
    if (!store) {
      // If store owner has no store, return an empty layout or proper response
      return null;
    }

    // Additionally get the users who rated this store
    // Let's get the latest 5 or 10 users for the dashboard
    const raters = await Rating.findUsersWhoRatedStore(store.id, { page: 1, limit: 10 });

    return {
      store: store,
      recent_ratings: raters.rows
    };
  }
}

module.exports = OwnerService;
