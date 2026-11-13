const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AnonymousIdentity = require('../models/AnonymousIdentity');
const { AppError } = require('../middleware/errorMiddleware');
const { generateRandomPseudonym, getRandomAvatarColor } = require('../utils/identityGenerator');
const { getJwtSecret } = require('../config/jwt');

/**
 * Sign a JWT token containing user ID and role
 */
const signToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user account and generate their initial anonymous identity
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide an email and password.', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters long.', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return next(new AppError('An account with this email address already exists.', 409));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user account
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'user',
    });

    // Generate unique random anonymous persona
    let pseudonym = generateRandomPseudonym();
    // Ensure pseudonym uniqueness
    let duplicate = await AnonymousIdentity.findOne({ pseudonym });
    while (duplicate) {
      pseudonym = generateRandomPseudonym();
      duplicate = await AnonymousIdentity.findOne({ pseudonym });
    }

    const identity = await AnonymousIdentity.create({
      userId: user._id,
      pseudonym,
      avatarColor: getRandomAvatarColor(),
      bio: 'A gentle voice wandering in the echoes.',
    });

    // Generate token
    const token = signToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created and anonymous identity generated',
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      identity: identity.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate existing user and return JWT
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide both email and password.', 400));
    }

    // Find user and explicitly select passwordHash
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // Check account status
    if (!user.isActive) {
      return next(new AppError('This account has been deactivated.', 403));
    }

    if (user.isCurrentlyRestricted()) {
      return next(
        new AppError(
          `Your account has been temporarily restricted: ${user.restrictionReason || 'Guideline violation'}`,
          403
        )
      );
    }

    // Find anonymous identity
    let identity = await AnonymousIdentity.findOne({ userId: user._id, isActive: true });
    if (!identity) {
      // Create one if none exists
      identity = await AnonymousIdentity.create({
        userId: user._id,
        pseudonym: generateRandomPseudonym(),
        avatarColor: getRandomAvatarColor(),
        bio: 'A gentle voice wandering in the echoes.',
      });
    }

    const token = signToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      identity: identity.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Client logout
 * Clears client session instructions. In stateless JWT architecture, the client
 * purges the stored Bearer token from localStorage.
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Client session cleared.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve authenticated user profile and active anonymous identity
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.identity) {
      return next(new AppError('Authentication required.', 401));
    }

    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
      identity: req.identity.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
