const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

class AuthService {
  /**
   * Register a new user
   */
  static async register({ name, email, password, role }) {
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email is already registered.');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Generate JWT
    const token = generateToken({ id: newUser.id, role: newUser.role, email: newUser.email });

    return {
      user: newUser,
      token
    };
  }

  /**
   * Log in an existing user
   */
  static async login({ email, password }) {
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    if (!user.password) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = generateToken({ id: user.id, role: user.role, email: user.email });

    // Clean user response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }
}

module.exports = AuthService;
