const mongoose = require('mongoose');
const Thought = require('../models/Thought');
const EmpathyResponse = require('../models/EmpathyResponse');
const { AppError } = require('../middleware/errorMiddleware');

const VALID_EMPATHY_TYPES = ['understand', 'not_alone', 'support', 'relate', 'thanks'];

// Mapping between reactionType enum and Thought.empathyCounts field names
const COUNTER_MAP = {
  understand: 'understand',
  not_alone: 'notAlone',
  support: 'support',
  relate: 'relate',
  thanks: 'thanks',
};

/**
 * Toggle empathy reaction on a thought
 * POST /api/thoughts/:id/empathy
 */
const toggleEmpathy = async (req, res, next) => {
  try {
    const { id: thoughtId } = req.params;
    const { reactionType } = req.body;

    if (!VALID_EMPATHY_TYPES.includes(reactionType)) {
      return next(
        new AppError(
          `Invalid empathy type. Must be one of: ${VALID_EMPATHY_TYPES.join(', ')}`,
          400
        )
      );
    }

    if (!mongoose.Types.ObjectId.isValid(thoughtId)) {
      return next(new AppError('Invalid thought ID format', 400));
    }

    const thought = await Thought.findOne({
      _id: thoughtId,
      status: 'active',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    if (!thought) {
      return next(new AppError('Thought not found or has expired.', 404));
    }

    const counterKey = COUNTER_MAP[reactionType];

    // Check if the user already sent this reaction
    const existing = await EmpathyResponse.findOne({
      thought: thought._id,
      user: req.user._id,
      reactionType,
    });

    if (existing) {
      // Toggle off / remove reaction
      await EmpathyResponse.findByIdAndDelete(existing._id);

      // Decrement counts (ensure doesn't drop below 0)
      const updatedThought = await Thought.findByIdAndUpdate(
        thought._id,
        {
          $inc: {
            [`empathyCounts.${counterKey}`]: -1,
            'empathyCounts.total': -1,
          },
        },
        { returnDocument: 'after' }
      );

      return res.status(200).json({
        success: true,
        action: 'removed',
        reactionType,
        empathyCounts: updatedThought.empathyCounts,
      });
    }

    // Otherwise create empathy reaction
    await EmpathyResponse.create({
      thought: thought._id,
      identity: req.identity._id,
      user: req.user._id,
      reactionType,
    });

    // Increment counts
    const updatedThought = await Thought.findByIdAndUpdate(
      thought._id,
      {
        $inc: {
          [`empathyCounts.${counterKey}`]: 1,
          'empathyCounts.total': 1,
        },
      },
      { returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      action: 'added',
      reactionType,
      empathyCounts: updatedThought.empathyCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get empathy breakdown and current user's reaction status
 * GET /api/thoughts/:id/empathy
 */
const getEmpathy = async (req, res, next) => {
  try {
    const { id: thoughtId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(thoughtId)) {
      return next(new AppError('Invalid thought ID format', 400));
    }

    const thought = await Thought.findById(thoughtId);
    if (!thought) {
      return next(new AppError('Thought not found', 404));
    }

    let userReactions = [];
    if (req.user) {
      const myReactions = await EmpathyResponse.find({
        thought: thought._id,
        user: req.user._id,
      }).select('reactionType');
      userReactions = myReactions.map((r) => r.reactionType);
    }

    res.status(200).json({
      success: true,
      empathyCounts: thought.empathyCounts,
      userReactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleEmpathy,
  getEmpathy,
};
