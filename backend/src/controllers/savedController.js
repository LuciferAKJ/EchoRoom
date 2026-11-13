const mongoose = require('mongoose');
const Thought = require('../models/Thought');
const SavedThought = require('../models/SavedThought');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * Toggle bookmarking a thought
 * POST /api/thoughts/:id/save
 */
const toggleSaveThought = async (req, res, next) => {
  try {
    const { id: thoughtId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(thoughtId)) {
      return next(new AppError('Invalid thought ID format', 400));
    }

    const thought = await Thought.findOne({
      _id: thoughtId,
      status: 'active',
    });

    if (!thought) {
      return next(new AppError('Thought not found or has been removed.', 404));
    }

    const existing = await SavedThought.findOne({
      user: req.user._id,
      thought: thought._id,
    });

    if (existing) {
      await SavedThought.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isSaved: false,
        action: 'unsaved',
        message: 'Thought removed from bookmarks',
      });
    }

    await SavedThought.create({
      user: req.user._id,
      identity: req.identity._id,
      thought: thought._id,
    });

    res.status(200).json({
      success: true,
      isSaved: true,
      action: 'saved',
      message: 'Thought saved to personal bookmarks',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookmarked thoughts for the authenticated user
 * GET /api/thoughts/saved
 */
const getSavedThoughts = async (req, res, next) => {
  try {
    const saved = await SavedThought.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'thought',
        match: { status: 'active' },
        populate: {
          path: 'authorIdentity',
          select: 'pseudonym avatarColor bio',
        },
      })
      .lean();

    // Filter out thoughts that might have expired or been removed
    const activeSaved = saved
      .filter((s) => s.thought !== null)
      .map((s) => ({
        _id: s._id,
        savedAt: s.createdAt,
        thought: s.thought,
      }));

    res.status(200).json({
      success: true,
      count: activeSaved.length,
      data: activeSaved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if a specific thought is saved by current user
 * GET /api/thoughts/:id/is-saved
 */
const checkIsSaved = async (req, res, next) => {
  try {
    const { id: thoughtId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(thoughtId)) {
      return res.status(200).json({ success: true, isSaved: false });
    }

    const exists = await SavedThought.exists({
      user: req.user._id,
      thought: thoughtId,
    });

    res.status(200).json({
      success: true,
      isSaved: !!exists,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleSaveThought,
  getSavedThoughts,
  checkIsSaved,
};

