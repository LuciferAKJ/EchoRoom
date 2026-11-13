const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    thought: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thought',
      required: [true, 'Thought reference is required'],
      index: true,
    },
    authorIdentity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnonymousIdentity',
      required: [true, 'Author identity reference is required'],
      index: true,
    },
    authorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author user reference is required'],
      select: false, // Hidden from public queries
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'removed'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ thought: 1, status: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
