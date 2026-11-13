const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/community', analyticsController.getCommunityAnalytics);

module.exports = router;
