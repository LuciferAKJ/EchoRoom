const mongoose = require('mongoose');

const thoughtSchema = new mongoose.Schema(
  {
    authorIdentity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnonymousIdentity',
      required: [true, 'Author anonymous identity is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Thought content is required'],
      trim: true,
      minlength: [3, 'Thought must be at least 3 characters'],
      maxlength: [2000, 'Thought cannot exceed 2000 characters'],
    },
    emotion: {
      type: String,
      required: [true, 'Emotion category is required'],
      enum: {
        values: [
          'Happy',
          'Sad',
          'Confused',
          'Frustrated',
          'Hopeful',
          'Lonely',
          'Grateful',
          'Motivated',
        ],
        message: '{VALUE} is not a valid emotion category',
      },
      index: true,
    },
    topics: {
      type: [String],
      default: [],
      index: true,
    },
    expirationSetting: {
      type: String,
      enum: ['24h', '3d', '7d', 'never'],
      default: 'never',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'removed'],
      default: 'active',
      index: true,
    },
    empathyCounts: {
      understand: { type: Number, default: 0 },
      notAlone: { type: Number, default: 0 },
      support: { type: Number, default: 0 },
      relate: { type: Number, default: 0 },
      thanks: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for automatic physical document cleanup by MongoDB
thoughtSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $type: 'date' } } });

// Query indexes for fast feed discovery & filtering
thoughtSchema.index({ status: 1, createdAt: -1 });
thoughtSchema.index({ status: 1, emotion: 1, createdAt: -1 });
thoughtSchema.index({ status: 1, 'empathyCounts.total': -1, createdAt: -1 });

const Thought = mongoose.model('Thought', thoughtSchema);
module.exports = Thought;

