const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AnonymousIdentity = require('../models/AnonymousIdentity');
const { AppError } = require('./errorMiddleware');
const { getJwtSecret } = require('../config/jwt');

/**
 * Middleware to protect private routes requiring authentication.
 * Verifies JWT token and attaches `req.user` and `req.identity`.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please provide a valid token.', 401)
      );
    }

    // Verify token
    const decoded = jwt.verify(token, getJwtSecret());

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new AppError('This user account has been deactivated.', 403));
    }

    // Check if user is currently restricted
    if (user.isCurrentlyRestricted()) {
      return next(
        new AppError(
          `Your account is temporarily restricted: ${user.restrictionReason || 'Community guideline violation'}`,
          403
        )
      );
    }

    // Find user's active anonymous identity
    let identity = await AnonymousIdentity.findOne({ userId: user._id, isActive: true });
    if (!identity) {
      // Auto-fallback: if user has no identity, find any or create one
      identity = await AnonymousIdentity.findOne({ userId: user._id });
    }

    // Attach user and identity to request
    req.user = user;
    req.identity = identity;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware for optional authentication.
 * If token is present, it attaches req.user and req.identity without rejecting if missing.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next();

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.userId);
    if (user && user.isActive && !user.isCurrentlyRestricted()) {
      const identity = await AnonymousIdentity.findOne({ userId: user._id, isActive: true });
      req.user = user;
      req.identity = identity;
    }
    next();
  } catch (error) {
    // If optional token is invalid or expired, continue as guest
    next();
  }
};

/**
 * Restrict endpoint to specified user roles (e.g. 'admin', 'moderator')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  restrictTo,
};

