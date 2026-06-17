const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate } = require('../middleware/authMiddleware');

// General store routes available to authenticated users
router.use(authenticate);

router.get('/', storeController.getStores);
router.get('/:id', storeController.getStoreById);

module.exports = router;
