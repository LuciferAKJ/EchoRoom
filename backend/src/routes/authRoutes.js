const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireFields } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, requireFields(['email', 'password']), authController.register);
router.post('/login', authLimiter, requireFields(['email', 'password']), authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
