const express = require('express');
const AuthController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Route: POST /api/v1/auth/register
router.post('/register', validateRegister, AuthController.register);

// Route: POST /api/v1/auth/login
router.post('/login', validateLogin, AuthController.login);

// Route: POST /api/v1/auth/logout
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;
