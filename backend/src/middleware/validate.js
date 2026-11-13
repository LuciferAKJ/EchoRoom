const mongoose = require('mongoose');
const { AppError } = require('./errorMiddleware');

/**
 * Validates that specific fields exist in req.body
 */
const requireFields = (fields = []) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return next(
        new AppError(`Missing required fields: ${missing.join(', ')}`, 400)
      );
    }
    next();
  };
};

/**
 * Validates that an :id route parameter is a valid MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(`Invalid identifier format for :${paramName}`, 400));
    }
    next();
  };
};

/**
 * Sanitize and trim string inputs to prevent whitespace flooding
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

module.exports = {
  requireFields,
  validateObjectId,
  sanitizeBody,
};

