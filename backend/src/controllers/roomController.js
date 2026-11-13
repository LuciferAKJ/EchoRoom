const mongoose = require('mongoose');
const DiscussionRoom = require('../models/DiscussionRoom');
const RoomMessage = require('../models/RoomMessage');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * List active discussion rooms
 * GET /api/rooms
 */
const getRooms = async (req, res, next) => {
  try {
    const rooms = await DiscussionRoom.find({ isClosed: false })
      .sort({ activeParticipantsCount: -1, createdAt: -1 })
      .limit(30)
      .populate('creatorIdentity', 'pseudonym avatarColor bio')
      .lean();

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new discussion room
 * POST /api/rooms
 */
const createRoom = async (req, res, next) => {
  try {
    const { title, topic } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return next(new AppError('Room title must be at least 3 characters.', 400));
    }

    if (title.trim().length > 100) {
      return next(new AppError('Room title cannot exceed 100 characters.', 400));
    }

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return next(new AppError('Please provide a topic for this room.', 400));
    }

    if (!req.identity) {
      return next(new AppError('Anonymous identity required to create rooms.', 401));
    }

    const room = await DiscussionRoom.create({
      title: title.trim(),
      topic: topic.trim(),
      creatorIdentity: req.identity._id,
      creatorUser: req.user._id,
      activeParticipantsCount: 0,
      isClosed: false,
    });

    const populated = await DiscussionRoom.findById(room._id).populate(
      'creatorIdentity',
      'pseudonym avatarColor bio'
    );

    res.status(201).json({
      success: true,
      message: 'Discussion room created',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get room info and recent message history
 * GET /api/rooms/:id
 */
const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid room ID format', 400));
    }

    const room = await DiscussionRoom.findById(id).populate(
      'creatorIdentity',
      'pseudonym avatarColor bio'
    );

    if (!room) {
      return next(new AppError('Discussion room not found', 404));
    }

    // Fetch up to 50 recent messages
    const rawHistory = await RoomMessage.find({ room: room._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('senderIdentity', 'pseudonym avatarColor bio')
      .lean();

    const messages = rawHistory.reverse();

    res.status(200).json({
      success: true,
      data: {
        room,
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Close room (by creator or moderator/admin)
 * POST /api/rooms/:id/close
 */
const closeRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid room ID format', 400));
    }

    const room = await DiscussionRoom.findById(id);
    if (!room) {
      return next(new AppError('Discussion room not found', 404));
    }

    if (room.isClosed) {
      return res.status(200).json({
        success: true,
        message: 'Room is already closed',
      });
    }

    // Check permission
    const isCreator =
      req.identity && room.creatorIdentity.toString() === req.identity._id.toString();
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'moderator');

    if (!isCreator && !isAdmin) {
      return next(new AppError('You are not authorized to close this room.', 403));
    }

    room.isClosed = true;
    room.closedAt = new Date();
    room.activeParticipantsCount = 0;
    await room.save();

    // Broadcast room:closed event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(id).emit('room:closed', {
        roomId: id,
        message: 'This discussion room has been peacefully concluded by its creator.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Discussion room closed peacefully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  createRoom,
  getRoomById,
  closeRoom,
};
