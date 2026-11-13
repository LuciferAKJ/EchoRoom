const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identityController');

router.get('/me', identityController.getMyIdentity);
router.patch('/me', identityController.updateIdentity);

module.exports = router;
