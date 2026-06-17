const bcrypt = require('bcryptjs');
const User = require('../models/User');

class UserService {
  /**
   * Get user profile details
   */
  static async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Change a user's password
   */
  static async changePassword(userId, oldPassword, newPassword) {
    // Retrieve password hash from database
    const currentHash = await User.getPasswordHash(userId);
    if (!currentHash) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(oldPassword, currentHash);
    if (!isMatch) {
      const error = new Error('Current password is incorrect.');
      error.statusCode = 400;
      throw error;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save updated password
    const updated = await User.updatePassword(userId, hashedPassword);
    if (!updated) {
      const error = new Error('Failed to update password.');
      error.statusCode = 500;
      throw error;
    }

    return { message: 'Password updated successfully.' };
  }
}

module.exports = UserService;
