const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AnonymousIdentity = require('../models/AnonymousIdentity');
const DiscussionRoom = require('../models/DiscussionRoom');
const RoomMessage = require('../models/RoomMessage');

// In-memory tracking of active room members: Map<roomId, Map<socketId, { pseudonym, avatarColor, identityId }>>
const roomPresences = new Map();

// Rate limiting map: Map<socketId, lastMessageTimestamp>
const messageRateLimits = new Map();

/**
 * Socket.IO Authentication Middleware
 * Validates JWT token passed in handshake auth or authorization headers.
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization &&
        socket.handshake.headers.authorization.split(' ')[1]);

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'echoroom_jwt_development_secret_key_change_in_production'
    );

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive || user.isCurrentlyRestricted()) {
      return next(new Error('User account not authorized or currently restricted'));
    }

    const identity = await AnonymousIdentity.findOne({ userId: user._id, isActive: true });
    if (!identity) {
      return next(new Error('No anonymous identity found'));
    }

    // Attach verified user and public identity to socket
    socket.user = user;
    socket.identity = identity;
    next();
  } catch (error) {
    next(new Error('Invalid or expired socket token'));
  }
};

/**
 * Helper to update and broadcast room participant list
 */
const broadcastParticipants = async (io, roomId) => {
  const presenceMap = roomPresences.get(roomId);
  const participants = presenceMap ? Array.from(presenceMap.values()) : [];
  const count = participants.length;

  // Sync active count in MongoDB
  try {
    await DiscussionRoom.findByIdAndUpdate(roomId, { activeParticipantsCount: count });
  } catch (e) {
    // Non-fatal
  }

  io.to(roomId).emit('room:participants', {
    roomId,
    count,
    participants,
  });
};

/**
 * Initialize Room Socket Handlers
 */
const initRoomSocket = (io) => {
  // Apply auth middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const pseudonym = socket.identity.pseudonym;
    const avatarColor = socket.identity.avatarColor;
    const identityId = socket.identity._id.toString();

    console.log(`[Socket] Connected: ${pseudonym} (${socket.id})`);

    // ----------------- ROOM: JOIN -----------------
    socket.on('room:join', async (data) => {
      try {
        const roomId = typeof data === 'object' ? data.roomId : data;

        if (!roomId) {
          return socket.emit('room:error', { message: 'Room ID is required' });
        }

        const room = await DiscussionRoom.findOne({ _id: roomId, isClosed: false });
        if (!room) {
          return socket.emit('room:error', { message: 'Room not found or is closed' });
        }

        // Join socket channel
        socket.join(roomId);

        // Record presence in memory
        if (!roomPresences.has(roomId)) {
          roomPresences.set(roomId, new Map());
        }
        roomPresences.get(roomId).set(socket.id, {
          identityId,
          pseudonym,
          avatarColor,
        });

        // Fetch recent message history (latest 50 messages, ordered oldest to newest)
        const rawHistory = await RoomMessage.find({ room: roomId })
          .sort({ timestamp: -1 })
          .limit(50)
          .populate('senderIdentity', 'pseudonym avatarColor bio')
          .lean();

        const messages = rawHistory.reverse();

        // Emit room:joined to the joining client
        socket.emit('room:joined', {
          room: {
            _id: room._id,
            title: room.title,
            topic: room.topic,
            creatorIdentity: room.creatorIdentity,
            createdAt: room.createdAt,
          },
          messages,
        });

        // Broadcast updated presence to all room members
        await broadcastParticipants(io, roomId);
      } catch (err) {
        socket.emit('room:error', { message: err.message || 'Failed to join room' });
      }
    });

    // ----------------- MESSAGE: SEND -----------------
    socket.on('message:send', async (data) => {
      try {
        const { roomId, message } = data || {};

        if (!roomId || !message || typeof message !== 'string' || message.trim().length === 0) {
          return socket.emit('room:error', { message: 'Message content cannot be empty' });
        }

        if (message.trim().length > 1000) {
          return socket.emit('room:error', { message: 'Message exceeds 1000 characters' });
        }

        // Rate limiting: Max 1 message every 600ms per socket
        const lastMsgTime = messageRateLimits.get(socket.id) || 0;
        const now = Date.now();
        if (now - lastMsgTime < 600) {
          return socket.emit('room:error', {
            message: 'You are speaking too quickly. Please pause a moment.',
          });
        }
        messageRateLimits.set(socket.id, now);

        // Verify room is open
        const room = await DiscussionRoom.findOne({ _id: roomId, isClosed: false });
        if (!room) {
          return socket.emit('room:error', { message: 'This room has been closed' });
        }

        // Persist message to database
        const savedMessage = await RoomMessage.create({
          room: roomId,
          senderIdentity: socket.identity._id,
          senderUser: socket.user._id,
          message: message.trim(),
          timestamp: new Date(),
        });

        // Broadcast to everyone in the room
        io.to(roomId).emit('room:message', {
          _id: savedMessage._id,
          roomId,
          senderIdentity: {
            _id: socket.identity._id,
            pseudonym,
            avatarColor,
          },
          message: message.trim(),
          timestamp: savedMessage.timestamp,
        });
      } catch (err) {
        socket.emit('room:error', { message: err.message || 'Failed to send message' });
      }
    });

    // ----------------- ROOM: LEAVE -----------------
    socket.on('room:leave', async (data) => {
      try {
        const roomId = typeof data === 'object' ? data.roomId : data;
        if (!roomId) return;

        socket.leave(roomId);

        if (roomPresences.has(roomId)) {
          roomPresences.get(roomId).delete(socket.id);
          await broadcastParticipants(io, roomId);
        }
      } catch (e) {
        // Non-fatal
      }
    });

    // ----------------- DISCONNECT -----------------
    socket.on('disconnect', async () => {
      console.log(`[Socket] Disconnected: ${pseudonym} (${socket.id})`);
      messageRateLimits.delete(socket.id);

      // Clean up from all rooms this socket was in
      for (const [roomId, presenceMap] of roomPresences.entries()) {
        if (presenceMap.has(socket.id)) {
          presenceMap.delete(socket.id);
          await broadcastParticipants(io, roomId);
        }
      }
    });
  });
};

module.exports = {
  initRoomSocket,
  socketAuthMiddleware,
};
