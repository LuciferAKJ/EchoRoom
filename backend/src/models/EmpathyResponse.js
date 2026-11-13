const mongoose = require('mongoose');

const empathyResponseSchema = new mongoose.Schema(
  {
    thought: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thought',
      required: [true, 'Thought reference is required'],
      index: true,
    },
    identity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnonymousIdentity',
      required: [true, 'Identity reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    reactionType: {
      type: String,
      required: [true, 'Reaction type is required'],
      enum: {
        values: ['understand', 'not_alone', 'support', 'relate', 'thanks'],
        message: '{VALUE} is not a valid empathy reaction type',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reaction of the same type by the same user on the same thought
empathyResponseSchema.index({ thought: 1, user: 1, reactionType: 1 }, { unique: true });

const EmpathyResponse = mongoose.model('EmpathyResponse', empathyResponseSchema);
module.exports = EmpathyResponse;
