const DiscussionRoom = require('../models/DiscussionRoom');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * List active discussion rooms
 * GET /api/rooms
 */
const getRooms = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: [],
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
    res.status(201).json({
      success: true,
      message: 'Room createRoom controller ready',
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
    res.status(200).json({
      success: true,
      message: 'Room getRoomById controller ready',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Close room (by creator or moderator)
 * POST /api/rooms/:id/close
 */
const closeRoom = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Room closed',
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
