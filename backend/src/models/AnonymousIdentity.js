const mongoose = require('mongoose');

const anonymousIdentitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner user ID is required'],
      index: true,
    },
    pseudonym: {
      type: String,
      required: [true, 'Pseudonym is required'],
      trim: true,
      minlength: [3, 'Pseudonym must be at least 3 characters'],
      maxlength: [40, 'Pseudonym cannot exceed 40 characters'],
      index: true,
    },
    avatarColor: {
      type: String,
      default: '#b4a0e5', // Echo lavender
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'],
    },
    bio: {
      type: String,
      maxlength: [160, 'Bio cannot exceed 160 characters'],
      default: '',
      trim: true,
    },
    traits: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent exposing userId in public JSON output
anonymousIdentitySchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    pseudonym: this.pseudonym,
    avatarColor: this.avatarColor,
    bio: this.bio,
    traits: this.traits,
    createdAt: this.createdAt,
  };
};

const AnonymousIdentity = mongoose.model('AnonymousIdentity', anonymousIdentitySchema);
module.exports = AnonymousIdentity;
