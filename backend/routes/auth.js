/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * ==========================================
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * @route   POST /api/auth/register
 * @desc    Registers a new user in the system.
 *          Validates the name, email, and password. Checks for existing users
 *          before creating a new record and responding with a signed JWT.
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Who goes there? We need your name!'),
    body('email').isEmail().withMessage('Hmm, that email doesn’t look quite right.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Security first! Make your password at least 6 characters.'),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Looks like you’ve already booked a ticket with this email. Try logging in!',
        });
      }

      // Create user
      const user = await User.create({ name, email, password });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Our registration desk is a bit scrambled right now. Try again shortly!',
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates a user and returns a token.
 *          Verifies the email exists and the password matches the hash.
 *          Returns the user profile and a signed JWT on success.
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email for your boarding pass.'),
    body('password').notEmpty().withMessage('Don’t forget your password!'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Hold up! We couldn’t verify those credentials. Double check your email and password.',
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Hold up! We couldn’t verify those credentials. Double check your email and password.',
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Our login servers are taking a detour. Be right back!',
      });
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Fetches the profile of the currently authenticated user.
 *          Uses the `protect` middleware to verify the token.
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Looks like we lost your ticket. Could not fetch your profile right now.',
    });
  }
});

module.exports = router;
