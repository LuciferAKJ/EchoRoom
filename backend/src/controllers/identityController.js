const AnonymousIdentity = require('../models/AnonymousIdentity');
const { AppError } = require('../middleware/errorMiddleware');
const { generateRandomPseudonym, getRandomAvatarColor } = require('../utils/identityGenerator');

/**
 * Get current user's active anonymous identity
 * GET /api/identity/me
 */
const getMyIdentity = async (req, res, next) => {
  try {
    if (!req.identity) {
      return next(new AppError('No anonymous identity associated with this account.', 404));
    }

    res.status(200).json({
      success: true,
      data: req.identity.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update display pseudonym, avatar color, or bio
 * PATCH /api/identity/me
 */
const updateIdentity = async (req, res, next) => {
  try {
    if (!req.identity) {
      return next(new AppError('No anonymous identity associated with this account.', 404));
    }

    const { pseudonym, avatarColor, bio } = req.body;

    if (pseudonym) {
      const cleanPseudonym = pseudonym.trim();
      if (cleanPseudonym.length < 3 || cleanPseudonym.length > 40) {
        return next(new AppError('Pseudonym must be between 3 and 40 characters.', 400));
      }

      // Check if another active identity uses this pseudonym
      const duplicate = await AnonymousIdentity.findOne({
        pseudonym: cleanPseudonym,
        _id: { $ne: req.identity._id },
      });
      if (duplicate) {
        return next(new AppError('This pseudonym is already taken. Please choose another.', 409));
      }
      req.identity.pseudonym = cleanPseudonym;
    }

    if (avatarColor) {
      if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(avatarColor)) {
        return next(new AppError('Invalid hex color format.', 400));
      }
      req.identity.avatarColor = avatarColor;
    }

    if (bio !== undefined) {
      if (bio.length > 160) {
        return next(new AppError('Bio cannot exceed 160 characters.', 400));
      }
      req.identity.bio = bio.trim();
    }

    await req.identity.save();

    res.status(200).json({
      success: true,
      message: 'Anonymous persona updated successfully',
      data: req.identity.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suggest a newly randomized pseudonym
 * GET /api/identity/random
 */
const getRandomSuggestion = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        pseudonym: generateRandomPseudonym(),
        avatarColor: getRandomAvatarColor(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyIdentity,
  updateIdentity,
  getRandomSuggestion,
};
