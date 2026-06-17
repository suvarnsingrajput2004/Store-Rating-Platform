const AuthService = require('../services/authService');

class AuthController {
  /**
   * Handle user registration requests
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const result = await AuthService.register({ name, email, password, role });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handle user login requests
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      
      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handle user logout requests
   */
  static async logout(req, res, next) {
    try {
      // In a stateless JWT architecture, the client destroys the token.
      // We return a simple success response to confirm the logout.
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
