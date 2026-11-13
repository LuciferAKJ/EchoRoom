const Thought = require('../models/Thought');
const DiscussionRoom = require('../models/DiscussionRoom');
const EmpathyResponse = require('../models/EmpathyResponse');
const Comment = require('../models/Comment');

/**
 * Aggregated community analytics
 * GET /api/analytics/community
 */
const getCommunityAnalytics = async (req, res, next) => {
  try {
    const activeFilter = {
      status: 'active',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    };

    // 1. Emotion Distribution Aggregation
    const emotionAggregation = await Thought.aggregate([
      { $match: activeFilter },
      { $group: { _id: '$emotion', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalActiveThoughts = await Thought.countDocuments(activeFilter);

    // Format emotion distribution with percentages
    const emotionDistribution = emotionAggregation.map((item) => ({
      emotion: item._id,
      count: item.count,
      percentage: totalActiveThoughts > 0 ? Math.round((item.count / totalActiveThoughts) * 100) : 0,
    }));

    const dominantEmotion =
      emotionDistribution.length > 0 ? emotionDistribution[0].emotion : 'Peaceful';

    // 2. Total Empathy Shared
    const totalEmpathyShared = await EmpathyResponse.countDocuments();

    // 3. Active Rooms Count
    const activeRoomsCount = await DiscussionRoom.countDocuments({ isClosed: false });

    // 4. Total Written Responses
    const totalComments = await Comment.countDocuments({ status: 'active' });

    // 5. Trending Topics Aggregation
    const topicsAggregation = await Thought.aggregate([
      { $match: activeFilter },
      { $unwind: '$topics' },
      { $group: { _id: '$topics', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const trendingTopics = topicsAggregation.map((t) => ({
      topic: t._id,
      count: t.count,
    }));

    // 6. Recent 7-Day Activity Trend
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activityAggregation = await Thought.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dominantEmotion,
        totalActiveThoughts,
        totalEmpathyShared,
        activeRoomsCount,
        totalComments,
        emotionDistribution,
        trendingTopics,
        activityTimeline: activityAggregation.map((a) => ({
          date: a._id,
          thoughts: a.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommunityAnalytics,
};
