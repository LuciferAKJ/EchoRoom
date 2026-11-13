const mongoose = require('mongoose');

const discussionRoomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Room title is required'],
      trim: true,
      minlength: [3, 'Room title must be at least 3 characters'],
      maxlength: [100, 'Room title cannot exceed 100 characters'],
    },
    topic: {
      type: String,
      required: [true, 'Room topic is required'],
      trim: true,
      maxlength: [50, 'Room topic cannot exceed 50 characters'],
      index: true,
    },
    creatorIdentity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnonymousIdentity',
      required: [true, 'Creator identity reference is required'],
    },
    creatorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
      select: false, // Internal tracking only
    },
    activeParticipantsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isClosed: {
      type: Boolean,
      default: false,
      index: true,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

discussionRoomSchema.index({ isClosed: 1, createdAt: -1 });

const DiscussionRoom = mongoose.model('DiscussionRoom', discussionRoomSchema);
module.exports = DiscussionRoom;

