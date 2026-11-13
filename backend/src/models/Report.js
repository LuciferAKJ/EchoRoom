const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    targetModel: {
      type: String,
      required: [true, 'Target model type is required'],
      enum: ['Thought', 'Comment', 'DiscussionRoom'],
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
      refPath: 'targetModel',
      index: true,
    },
    reporterIdentity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnonymousIdentity',
      default: null,
    },
    reporterUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user reference is required'],
      select: false,
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: [
        'harassment',
        'hate_speech',
        'spam',
        'inappropriate',
        'self_harm',
        'other',
      ],
      index: true,
    },
    details: {
      type: String,
      maxlength: [500, 'Details cannot exceed 500 characters'],
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    actionTaken: {
      type: String,
      enum: ['none', 'hidden', 'removed', 'user_warned', 'user_restricted'],
      default: 'none',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;

