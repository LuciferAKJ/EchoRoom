const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for sensitive authentication endpoints (prevent brute-force).
 * 100 requests per 15 minutes per IP (disabled in test environment).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts from this IP, please try again in 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * General API rate limiter.
 * 600 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 50000 : 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests created from this IP, please try again later.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = {
  authLimiter,
  apiLimiter,
};
