const { validationResult } = require('express-validator');
const RatingService = require('../services/ratingService');

exports.submitRating = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Role check happens in middleware, but just in case
    if (req.user.role !== 'USER') {
      return res.status(403).json({ success: false, message: 'Only standard users can submit ratings.' });
    }

    const rating = await RatingService.submitRating(req.user.id, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: rating
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRating = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const ratingId = req.params.id;
    const rating = await RatingService.updateRating(req.user.id, ratingId, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Rating updated successfully.',
      data: rating
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyRatings = async (req, res, next) => {
  try {
    const ratings = await RatingService.getMyRatings(req.user.id);
    res.status(200).json({
      success: true,
      data: ratings
    });
  } catch (error) {
    next(error);
  }
};
