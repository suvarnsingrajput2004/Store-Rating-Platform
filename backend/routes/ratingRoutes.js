const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { validateRating, validateRatingUpdate } = require('../validators/ratingValidator');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Only USER role can rate
router.use(authenticate);
router.use(authorize('USER'));

router.post('/', validateRating, ratingController.submitRating);
router.put('/:id', validateRatingUpdate, ratingController.updateRating);

module.exports = router;
