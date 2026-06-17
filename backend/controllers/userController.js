const UserService = require('../services/userService');

class UserController {
  /**
   * Retrieve the profile of the currently logged-in user
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await UserService.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handle user request to update/change password
   */
  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      const result = await UserService.changePassword(userId, oldPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
