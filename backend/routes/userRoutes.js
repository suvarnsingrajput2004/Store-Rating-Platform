const express = require('express');
const UserController = require('../controllers/userController');
const { validateChangePassword } = require('../validators/authValidator');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Route: GET /api/v1/users/profile
router.get('/profile', authenticate, UserController.getProfile);

// Route: PUT /api/v1/users/change-password
router.put('/change-password', authenticate, validateChangePassword, UserController.changePassword);

// Route: GET /api/v1/users/my-ratings (Only USER role)
const ratingController = require('../controllers/ratingController');
const { authorize } = require('../middleware/authMiddleware');
router.get('/my-ratings', authenticate, authorize('USER'), ratingController.getMyRatings);

module.exports = router;
