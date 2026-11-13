const express = require('express');
const router = express.Router();
const thoughtController = require('../controllers/thoughtController');
const empathyController = require('../controllers/empathyController');
const commentController = require('../controllers/commentController');
const savedController = require('../controllers/savedController');
const { validateObjectId, requireFields } = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');

// Public Feed, Random Discovery & Search
router.get('/', optionalAuth, thoughtController.getThoughts);
router.get('/discover', thoughtController.discoverRandomThought);
router.get('/search', thoughtController.searchThoughts);

// Bookmarked Thoughts Collection (Placed before /:id)
router.get('/saved', protect, savedController.getSavedThoughts);

// Protected Thought Creation
router.post(
  '/',
  protect,
  requireFields(['content', 'emotion']),
  thoughtController.createThought
);

// Single Thought Read (Public)
router.get('/:id', validateObjectId('id'), thoughtController.getThoughtById);

// Protected Mutation Routes (Author Only)
router.patch('/:id', protect, validateObjectId('id'), thoughtController.updateThought);
router.delete('/:id', protect, validateObjectId('id'), thoughtController.deleteThought);

// Empathy Reactions
router.post(
  '/:id/empathy',
  protect,
  validateObjectId('id'),
  requireFields(['reactionType']),
  empathyController.toggleEmpathy
);
router.get('/:id/empathy', optionalAuth, validateObjectId('id'), empathyController.getEmpathy);

// Comments & Responses
router.post(
  '/:id/comments',
  protect,
  validateObjectId('id'),
  requireFields(['content']),
  commentController.addComment
);
router.get('/:id/comments', optionalAuth, validateObjectId('id'), commentController.getComments);
router.delete('/:thoughtId/comments/:commentId', protect, commentController.deleteComment);

// Bookmarks / Saved Thoughts
router.post('/:id/save', protect, validateObjectId('id'), savedController.toggleSaveThought);
router.get('/:id/is-saved', protect, validateObjectId('id'), savedController.checkIsSaved);

module.exports = router;
