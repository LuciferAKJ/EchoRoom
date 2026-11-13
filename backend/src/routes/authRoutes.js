const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireFields } = require('../middleware/validate');

router.post('/register', requireFields(['email', 'password']), authController.register);
router.post('/login', requireFields(['email', 'password']), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);

module.exports = router;
