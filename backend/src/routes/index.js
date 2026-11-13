const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const identityRoutes = require('./identityRoutes');
const thoughtRoutes = require('./thoughtRoutes');
const roomRoutes = require('./roomRoutes');
const moderationRoutes = require('./moderationRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/identity', identityRoutes);
router.use('/thoughts', thoughtRoutes);
router.use('/rooms', roomRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/', moderationRoutes); // Mounts /reports and /admin/*

module.exports = router;

