const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Only STORE_OWNER can access these routes
router.use(authenticate);
router.use(authorize('STORE_OWNER'));

router.get('/dashboard', ownerController.getDashboard);

module.exports = router;
