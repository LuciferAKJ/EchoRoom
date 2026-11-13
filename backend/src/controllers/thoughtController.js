const mongoose = require('mongoose');
const Thought = require('../models/Thought');
const AnonymousIdentity = require('../models/AnonymousIdentity');
const { AppError } = require('../middleware/errorMiddleware');

const VALID_EMOTIONS = [
  'Happy',
  'Sad',
  'Confused',
  'Frustrated',
  'Hopeful',
  'Lonely',
  'Grateful',
  'Motivated',
];

/**
 * Calculate expiration Date object based on setting
 */
const calculateExpiration = (setting) => {
  const now = Date.now();
  switch (setting) {
    case '24h':
      return new Date(now + 24 * 60 * 60 * 1000);
    case '3d':
      return new Date(now + 3 * 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
    case 'never':
    default:
      return null;
  }
};

/**
 * Filter condition to ensure only active, non-expired thoughts are queried
 */
const getActiveFilter = (extra = {}) => {
  return {
    status: 'active',
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    ...extra,
  };
};

/**
 * Create a new anonymous thought
 * POST /api/thoughts
 */
const createThought = async (req, res, next) => {
  try {
    const { content, emotion, topics, expirationSetting = 'never' } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length < 3) {
      return next(new AppError('Thought content must be at least 3 characters.', 400));
    }

    if (content.trim().length > 2000) {
      return next(new AppError('Thought content cannot exceed 2000 characters.', 400));
    }

    if (!VALID_EMOTIONS.includes(emotion)) {
      return next(
        new AppError(
          `Invalid emotion. Must be one of: ${VALID_EMOTIONS.join(', ')}`,
          400
        )
      );
    }

    if (!req.identity) {
      return next(new AppError('You must have an anonymous identity to share a thought.', 401));
    }

    // Sanitize topics into clean array
    let cleanTopics = [];
    if (Array.isArray(topics)) {
      cleanTopics = topics
        .map((t) => String(t).trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 30);
    } else if (typeof topics === 'string' && topics.trim().length > 0) {
      cleanTopics = topics
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 30);
    }

    const expiresAt = calculateExpiration(expirationSetting);

    const thought = await Thought.create({
      authorIdentity: req.identity._id,
      content: content.trim(),
      emotion,
      topics: cleanTopics,
      expirationSetting,
      expiresAt,
      status: 'active',
    });

    const populatedThought = await Thought.findById(thought._id).populate(
      'authorIdentity',
      'pseudonym avatarColor bio'
    );

    res.status(201).json({
      success: true,
      message: 'Thought released into the echoes',
      data: populatedThought,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated thought feed with emotion, topic, and sort options
 * GET /api/thoughts
 */
const getThoughts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = getActiveFilter();

    // Emotion filter
    if (req.query.emotion && req.query.emotion !== 'All') {
      filter.emotion = req.query.emotion;
    }

    // Topic filter
    if (req.query.topic) {
      filter.topics = req.query.topic.toLowerCase().trim();
    }

    // Sorting: 'newest' (default) or 'popular'
    let sort = { createdAt: -1 };
    if (req.query.sort === 'popular') {
      sort = { 'empathyCounts.total': -1, createdAt: -1 };
    }

    const total = await Thought.countDocuments(filter);
    const thoughts = await Thought.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('authorIdentity', 'pseudonym avatarColor bio')
      .lean();

    res.status(200).json({
      success: true,
      count: thoughts.length,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      data: thoughts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single thought by ID
 * GET /api/thoughts/:id
 */
const getThoughtById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid thought identifier', 400));
    }

    const thought = await Thought.findOne(getActiveFilter({ _id: id })).populate(
      'authorIdentity',
      'pseudonym avatarColor bio'
    );

    if (!thought) {
      return next(new AppError('Thought not found or has expired.', 404));
    }

    res.status(200).json({
      success: true,
      data: thought,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update personal thought (content, emotion, topics)
 * PATCH /api/thoughts/:id
 */
const updateThought = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, emotion, topics } = req.body;

    const thought = await Thought.findOne({ _id: id, status: 'active' });
    if (!thought) {
      return next(new AppError('Thought not found.', 404));
    }

    // Verify authorship
    if (thought.authorIdentity.toString() !== req.identity._id.toString()) {
      return next(new AppError('You can only edit thoughts you personally shared.', 403));
    }

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length < 3) {
        return next(new AppError('Thought content must be at least 3 characters.', 400));
      }
      thought.content = content.trim();
    }

    if (emotion !== undefined) {
      if (!VALID_EMOTIONS.includes(emotion)) {
        return next(new AppError(`Invalid emotion. Must be one of: ${VALID_EMOTIONS.join(', ')}`, 400));
      }
      thought.emotion = emotion;
    }

    if (topics !== undefined) {
      if (Array.isArray(topics)) {
        thought.topics = topics
          .map((t) => String(t).trim().toLowerCase())
          .filter((t) => t.length > 0 && t.length <= 30);
      }
    }

    await thought.save();

    const populated = await Thought.findById(thought._id).populate(
      'authorIdentity',
      'pseudonym avatarColor bio'
    );

    res.status(200).json({
      success: true,
      message: 'Thought updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete personal thought (or admin deletion)
 * DELETE /api/thoughts/:id
 */
const deleteThought = async (req, res, next) => {
  try {
    const { id } = req.params;

    const thought = await Thought.findById(id);
    if (!thought) {
      return next(new AppError('Thought not found.', 404));
    }

    // Verify authorship or admin role
    const isAuthor = thought.authorIdentity.toString() === req.identity._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';

    if (!isAuthor && !isAdmin) {
      return next(new AppError('You are not authorized to delete this thought.', 403));
    }

    thought.status = 'removed';
    await thought.save();

    res.status(200).json({
      success: true,
      message: 'Thought removed from the echoes',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Discover a random unread thought (Serendipity)
 * GET /api/thoughts/discover
 */
const discoverRandomThought = async (req, res, next) => {
  try {
    const filter = getActiveFilter();

    // Use MongoDB $sample aggregation for efficient O(1) random selection
    const results = await Thought.aggregate([
      { $match: filter },
      { $sample: { size: 1 } },
    ]);

    if (!results || results.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No thoughts wandering in the echoes yet.',
      });
    }

    const populated = await Thought.findById(results[0]._id).populate(
      'authorIdentity',
      'pseudonym avatarColor bio'
    );

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search thoughts across content and topics
 * GET /api/thoughts/search?q=keyword
 */
const searchThoughts = async (req, res, next) => {
  try {
    const query = req.query.q ? req.query.q.trim() : '';

    if (!query) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Escaping special regex characters to prevent ReDoS
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const filter = getActiveFilter({
      $or: [{ content: regex }, { topics: regex }],
    });

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const total = await Thought.countDocuments(filter);
    const thoughts = await Thought.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorIdentity', 'pseudonym avatarColor bio')
      .lean();

    res.status(200).json({
      success: true,
      query,
      count: thoughts.length,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      data: thoughts,
    });
  } catch (error) {
    next(error);
  }
};

// Forward-compatible placeholders for Step 6 interactions
const addEmpathy = async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Ready for Step 6' });
};
const getEmpathy = async (req, res, next) => {
  res.status(200).json({ success: true, data: {} });
};
const addComment = async (req, res, next) => {
  res.status(201).json({ success: true, message: 'Ready for Step 6' });
};
const getComments = async (req, res, next) => {
  res.status(200).json({ success: true, data: [] });
};
const saveThought = async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Ready for Step 6' });
};
const unsaveThought = async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Ready for Step 6' });
};

module.exports = {
  createThought,
  getThoughts,
  getThoughtById,
  updateThought,
  deleteThought,
  discoverRandomThought,
  searchThoughts,
  addEmpathy,
  getEmpathy,
  addComment,
  getComments,
  saveThought,
  unsaveThought,
};
