const { body } = require('express-validator');

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

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
    .withMessage('Rating must be an integer between 1 and 5.'),
  validate
];

const validateRatingUpdate = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
  validate
];

module.exports = {
  validateRating,
  validateRatingUpdate
};
