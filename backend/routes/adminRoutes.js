const express = require('express');
const AdminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  validateAdminUserCreate,
  validateAdminUserUpdate,
  validateAdminStore
} = require('../validators/adminValidator');

const router = express.Router();

// Enforce authentication and ADMIN role for all routes in this router
router.use(authenticate, authorize('ADMIN'));

// Dashboard Stats Route
router.get('/dashboard', AdminController.getDashboardStats);

// User Management Routes
router.post('/users', validateAdminUserCreate, AdminController.createUser);
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id', validateAdminUserUpdate, AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Store Management Routes
router.post('/stores', validateAdminStore, AdminController.createStore);
router.get('/stores', AdminController.getStores);
router.get('/stores/:id', AdminController.getStoreById);
router.put('/stores/:id', validateAdminStore, AdminController.updateStore);
router.delete('/stores/:id', AdminController.deleteStore);

module.exports = router;
