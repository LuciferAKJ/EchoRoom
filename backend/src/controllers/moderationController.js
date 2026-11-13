const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');
const Thought = require('../models/Thought');
const Comment = require('../models/Comment');
const DiscussionRoom = require('../models/DiscussionRoom');
const { AppError } = require('../middleware/errorMiddleware');
const { scanContentForSafety } = require('../utils/contentFilter');

/**
 * File a community report against content
 * POST /api/reports
 */
const createReport = async (req, res, next) => {
  try {
    const { targetModel, targetId, reason, details } = req.body;

    const VALID_MODELS = ['Thought', 'Comment', 'DiscussionRoom'];
    if (!VALID_MODELS.includes(targetModel)) {
      return next(new AppError(`Target must be one of: ${VALID_MODELS.join(', ')}`, 400));
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return next(new AppError('Invalid target ID format', 400));
    }

    // Verify target exists
    let targetDoc = null;
    if (targetModel === 'Thought') targetDoc = await Thought.findById(targetId);
    if (targetModel === 'Comment') targetDoc = await Comment.findById(targetId);
    if (targetModel === 'DiscussionRoom') targetDoc = await DiscussionRoom.findById(targetId);

    if (!targetDoc) {
      return next(new AppError('The reported content no longer exists.', 404));
    }

    // Scan for safety hints
    const safetyCheck = scanContentForSafety(details || '');

    const report = await Report.create({
      targetModel,
      targetId,
      reporterUser: req.user._id,
      reporterIdentity: req.identity ? req.identity._id : null,
      reason,
      details: details ? details.trim() : '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will review this shortly.',
      data: {
        _id: report._id,
        targetModel: report.targetModel,
        status: report.status,
        safetyFlagged: safetyCheck.isFlagged,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get moderation reports
 * GET /api/admin/reports
 */
const getAdminReports = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    const filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('reporterIdentity', 'pseudonym avatarColor')
      .populate('reviewedBy', 'email role')
      .lean();

    // Attach target summaries
    const populatedReports = await Promise.all(
      reports.map(async (rep) => {
        let contentSnippet = '[Content Deleted]';
        try {
          if (rep.targetModel === 'Thought') {
            const t = await Thought.findById(rep.targetId).populate('authorIdentity', 'pseudonym');
            if (t) contentSnippet = t.content;
          } else if (rep.targetModel === 'Comment') {
            const c = await Comment.findById(rep.targetId);
            if (c) contentSnippet = c.content;
          } else if (rep.targetModel === 'DiscussionRoom') {
            const r = await DiscussionRoom.findById(rep.targetId);
            if (r) contentSnippet = `${r.title} (${r.topic})`;
          }
        } catch (e) {}

        return {
          ...rep,
          contentSnippet,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: populatedReports.length,
      data: populatedReports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update report resolution and take action
 * PATCH /api/admin/reports/:id
 */
const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return next(new AppError('Report not found', 404));
    }

    if (status) report.status = status;
    if (actionTaken) report.actionTaken = actionTaken;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();

    // Apply content hiding or removal if requested
    if (actionTaken === 'hidden' || actionTaken === 'removed') {
      const newStatus = actionTaken === 'removed' ? 'removed' : 'hidden';
      if (report.targetModel === 'Thought') {
        await Thought.findByIdAndUpdate(report.targetId, { status: newStatus });
      } else if (report.targetModel === 'Comment') {
        await Comment.findByIdAndUpdate(report.targetId, { status: newStatus });
      } else if (report.targetModel === 'DiscussionRoom') {
        await DiscussionRoom.findByIdAndUpdate(report.targetId, { isClosed: true });
      }
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report resolved and content action applied',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Temporarily restrict a user account
 * PATCH /api/admin/users/:id/restriction
 */
const restrictUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isRestricted, reason, durationDays } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    targetUser.isRestricted = !!isRestricted;
    targetUser.restrictionReason = reason || 'Violation of community safety guidelines';

    if (isRestricted && durationDays) {
      targetUser.restrictionExpiresAt = new Date(
        Date.now() + parseInt(durationDays, 10) * 24 * 60 * 60 * 1000
      );
    } else if (!isRestricted) {
      targetUser.restrictionExpiresAt = null;
      targetUser.restrictionReason = null;
    }

    await targetUser.save();

    res.status(200).json({
      success: true,
      message: isRestricted
        ? `Account restricted for ${durationDays || 'indefinite'} days`
        : 'Account restriction lifted',
      user: {
        _id: targetUser._id,
        email: targetUser.email,
        isRestricted: targetUser.isRestricted,
        restrictionExpiresAt: targetUser.restrictionExpiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getAdminReports,
  updateReportStatus,
  restrictUser,
};
