const express = require('express');
const router = express.Router();
const thoughtController = require('../controllers/thoughtController');
const { validateObjectId, requireFields } = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');

// Public Feed, Random Discovery & Search
router.get('/', optionalAuth, thoughtController.getThoughts);
router.get('/discover', thoughtController.discoverRandomThought);
router.get('/search', thoughtController.searchThoughts);

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

// Empathy interactions (Step 6)
router.post('/:id/empathy', protect, validateObjectId('id'), thoughtController.addEmpathy);
router.get('/:id/empathy', validateObjectId('id'), thoughtController.getEmpathy);

// Comments (Step 6)
router.post(
  '/:id/comments',
  protect,
  validateObjectId('id'),
  requireFields(['content']),
  thoughtController.addComment
);
router.get('/:id/comments', validateObjectId('id'), thoughtController.getComments);

// Saved Bookmarks (Step 6)
router.post('/:id/save', protect, validateObjectId('id'), thoughtController.saveThought);
router.delete('/:id/save', protect, validateObjectId('id'), thoughtController.unsaveThought);

module.exports = router;
