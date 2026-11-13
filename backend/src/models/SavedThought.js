const mongoose = require('mongoose');

const savedThoughtSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    identity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnonymousIdentity',
      required: [true, 'Identity reference is required'],
    },
    thought: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thought',
      required: [true, 'Thought reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saves of the same thought by the same user
savedThoughtSchema.index({ user: 1, thought: 1 }, { unique: true });

const SavedThought = mongoose.model('SavedThought', savedThoughtSchema);
module.exports = SavedThought;

