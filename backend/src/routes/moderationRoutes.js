const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const { validateObjectId, requireFields } = require('../middleware/validate');

// Public report creation
router.post('/reports', requireFields(['targetModel', 'targetId', 'reason']), moderationController.createReport);

// Admin-only management endpoints
router.get('/admin/reports', moderationController.getAdminReports);
router.patch('/admin/reports/:id', validateObjectId('id'), moderationController.updateReportStatus);
router.patch('/admin/users/:id/restriction', validateObjectId('id'), moderationController.restrictUser);

module.exports = router;
