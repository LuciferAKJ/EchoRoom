const express = require('express');
const router = express.Router();
const thoughtController = require('../controllers/thoughtController');
const { validateObjectId, requireFields } = require('../middleware/validate');

// Public feed, search, serendipity
router.get('/', thoughtController.getThoughts);
router.post('/', requireFields(['content', 'emotion']), thoughtController.createThought);
router.get('/discover', thoughtController.discoverRandomThought);
router.get('/search', thoughtController.searchThoughts);

// Single thought operations
router.get('/:id', validateObjectId('id'), thoughtController.getThoughtById);
router.patch('/:id', validateObjectId('id'), thoughtController.updateThought);
router.delete('/:id', validateObjectId('id'), thoughtController.deleteThought);

// Empathy interactions
router.post('/:id/empathy', validateObjectId('id'), thoughtController.addEmpathy);
router.get('/:id/empathy', validateObjectId('id'), thoughtController.getEmpathy);

// Comments
router.post('/:id/comments', validateObjectId('id'), requireFields(['content']), thoughtController.addComment);
router.get('/:id/comments', validateObjectId('id'), thoughtController.getComments);

// Saved bookmarks
router.post('/:id/save', validateObjectId('id'), thoughtController.saveThought);
router.delete('/:id/save', validateObjectId('id'), thoughtController.unsaveThought);

module.exports = router;
