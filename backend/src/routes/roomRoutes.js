const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { validateObjectId, requireFields } = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', roomController.getRooms);
router.post('/', protect, requireFields(['title', 'topic']), roomController.createRoom);
router.get('/:id', validateObjectId('id'), roomController.getRoomById);
router.post('/:id/close', protect, validateObjectId('id'), roomController.closeRoom);

module.exports = router;
