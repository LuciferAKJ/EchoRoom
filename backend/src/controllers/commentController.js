const mongoose = require('mongoose');
const Thought = require('../models/Thought');
const Comment = require('../models/Comment');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * Add a written response to a thought
 * POST /api/thoughts/:id/comments
 */
const addComment = async (req, res, next) => {
  try {
    const { id: thoughtId } = req.params;
    const { content, parentComment } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return next(new AppError('Comment content cannot be empty.', 400));
    }

    if (content.trim().length > 1000) {
      return next(new AppError('Comment cannot exceed 1000 characters.', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(thoughtId)) {
      return next(new AppError('Invalid thought ID', 400));
    }

    const thought = await Thought.findOne({
      _id: thoughtId,
      status: 'active',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    if (!thought) {
      return next(new AppError('Thought not found or has expired.', 404));
    }

    // Verify parent comment if nested
    let parentCommentId = null;
    if (parentComment && mongoose.Types.ObjectId.isValid(parentComment)) {
      const parent = await Comment.findOne({ _id: parentComment, thought: thought._id, status: 'active' });
      if (parent) {
        parentCommentId = parent._id;
      }
    }

    const comment = await Comment.create({
      thought: thought._id,
      authorIdentity: req.identity._id,
      authorUser: req.user._id,
      content: content.trim(),
      parentComment: parentCommentId,
      status: 'active',
    });

    // Increment thought comment count
    await Thought.findByIdAndUpdate(thought._id, {
      $inc: { commentCount: 1 },
    });

    const populated = await Comment.findById(comment._id).populate(
      'authorIdentity',
      'pseudonym avatarColor bio'
    );

    res.status(201).json({
      success: true,
      message: 'Warm response shared',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated comments for a thought
 * GET /api/thoughts/:id/comments
 */
const getComments = async (req, res, next) => {
  try {
    const { id: thoughtId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(thoughtId)) {
      return next(new AppError('Invalid thought ID', 400));
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {
      thought: thoughtId,
      status: 'active',
    };

    const total = await Comment.countDocuments(filter);
    const comments = await Comment.find(filter)
      .sort({ createdAt: 1 }) // Chronological order for natural discussion
      .skip(skip)
      .limit(limit)
      .populate('authorIdentity', 'pseudonym avatarColor bio')
      .lean();

    res.status(200).json({
      success: true,
      count: comments.length,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment (by comment author, thought author, or admin)
 * DELETE /api/thoughts/:thoughtId/comments/:commentId
 */
const deleteComment = async (req, res, next) => {
  try {
    const { thoughtId, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return next(new AppError('Invalid comment ID', 400));
    }

    const comment = await Comment.findOne({ _id: commentId, status: 'active' });
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }

    const thought = await Thought.findById(comment.thought);

    // Permission check
    const isCommentAuthor =
      req.identity && comment.authorIdentity.toString() === req.identity._id.toString();
    const isThoughtAuthor =
      thought && req.identity && thought.authorIdentity.toString() === req.identity._id.toString();
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'moderator');

    if (!isCommentAuthor && !isThoughtAuthor && !isAdmin) {
      return next(new AppError('You are not authorized to delete this response.', 403));
    }

    comment.status = 'removed';
    await comment.save();

    // Decrement comment count on thought
    if (thought && thought.commentCount > 0) {
      await Thought.findByIdAndUpdate(thought._id, {
        $inc: { commentCount: -1 },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Response removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
};

