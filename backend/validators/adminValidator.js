const { body, validationResult } = require('express-validator');

// Helper to extract and format validation errors
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

const validateAdminUserCreate = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character.'),
  
  body('role')
    .isIn(['USER', 'STORE_OWNER', 'ADMIN'])
    .withMessage('Invalid user role specified.'),
  
  validate
];

const validateAdminUserUpdate = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  
  body('role')
    .isIn(['USER', 'STORE_OWNER', 'ADMIN'])
    .withMessage('Invalid user role specified.'),
  
  validate
];

const validateAdminStore = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required.')
    .isLength({ max: 255 })
    .withMessage('Store name cannot exceed 255 characters.'),
  
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Store address is required.')
    .isLength({ max: 400 })
    .withMessage('Store address cannot exceed 400 characters.'),
  
  body('owner_id')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === '' || value === null) return true;
      if (!Number.isInteger(Number(value))) {
        throw new Error('Owner ID must be a valid integer.');
      }
      return true;
    }),
  
  validate
];

module.exports = {
  validateAdminUserCreate,
  validateAdminUserUpdate,
  validateAdminStore
};
