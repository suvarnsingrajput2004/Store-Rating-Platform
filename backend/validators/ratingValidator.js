const { body } = require('express-validator');

const validateRating = [
  body('store_id')
    .notEmpty()
    .withMessage('Store ID is required.')
    .isInt()
    .withMessage('Store ID must be an integer.'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.')
];

const validateRatingUpdate = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.')
];

module.exports = {
  validateRating,
  validateRatingUpdate
};
