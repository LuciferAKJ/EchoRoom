const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const { validateObjectId, requireFields } = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');

// Public report creation (authenticated users)
router.post(
  '/reports',
  protect,
  requireFields(['targetModel', 'targetId', 'reason']),
  moderationController.createReport
);

// Admin-only management endpoints
router.get(
  '/admin/reports',
  protect,
  restrictTo('admin', 'moderator'),
  moderationController.getAdminReports
);

router.patch(
  '/admin/reports/:id',
  protect,
  restrictTo('admin', 'moderator'),
  validateObjectId('id'),
  moderationController.updateReportStatus
);

router.patch(
  '/admin/users/:id/restriction',
  protect,
  restrictTo('admin'),
  validateObjectId('id'),
  moderationController.restrictUser
);

module.exports = router;
