const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identityController');
const { protect } = require('../middleware/auth');

router.get('/random', identityController.getRandomSuggestion);
router.get('/me', protect, identityController.getMyIdentity);
router.patch('/me', protect, identityController.updateIdentity);

module.exports = router;
