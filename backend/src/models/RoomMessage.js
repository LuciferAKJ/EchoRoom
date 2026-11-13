const mongoose = require('mongoose');

const roomMessageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscussionRoom',
      required: [true, 'Room reference is required'],
      index: true,
    },
    senderIdentity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnonymousIdentity',
      required: [true, 'Sender identity reference is required'],
    },
    senderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender user reference is required'],
      select: false, // Internal moderation only
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

roomMessageSchema.index({ room: 1, createdAt: 1 });

const RoomMessage = mongoose.model('RoomMessage', roomMessageSchema);
module.exports = RoomMessage;
