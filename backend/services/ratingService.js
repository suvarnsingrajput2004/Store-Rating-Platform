const Rating = require('../models/Rating');
const Store = require('../models/Store');

class RatingService {
  static async submitRating(userId, data) {
    const { store_id, rating } = data;

    // Check if store exists
    const store = await Store.findById(store_id);
    if (!store) {
      const error = new Error('Store not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check for duplicate rating
    const existingRating = await Rating.findByUserAndStore(userId, store_id);
    if (existingRating) {
      const error = new Error('You have already rated this store.');
      error.statusCode = 400;
      throw error;
    }

    // Create rating
    const ratingId = await Rating.create({ store_id, user_id: userId, rating });
    
    // Return the newly created rating
    return await Rating.findById(ratingId);
  }

  static async updateRating(userId, ratingId, data) {
    const { rating } = data;

    // Verify rating exists and belongs to user
    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
      const error = new Error('Rating not found.');
      error.statusCode = 404;
      throw error;
    }

    if (existingRating.user_id !== userId) {
      const error = new Error('You can only update your own ratings.');
      error.statusCode = 403;
      throw error;
    }

    // Update rating
    await Rating.update(ratingId, rating);

    return await Rating.findById(ratingId);
  }

  static async getMyRatings(userId) {
    return await Rating.findByUserId(userId);
  }
}

module.exports = RatingService;
