const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');

class AuthController {
  /**
   * Register a new user
   */
  static async register(req, res) {
    try {
      const { name, email, password, studentId } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        studentId,
        role: 'customer',
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id, user.role);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user._id, user.role);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        preferences: user.preferences,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const { name, phone, profilePicture } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { name, phone, profilePicture },
        { new: true }
      );

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
