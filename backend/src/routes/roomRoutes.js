const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { validateObjectId, requireFields } = require('../middleware/validate');

router.get('/', roomController.getRooms);
router.post('/', requireFields(['title', 'topic']), roomController.createRoom);
router.get('/:id', validateObjectId('id'), roomController.getRoomById);
router.post('/:id/close', validateObjectId('id'), roomController.closeRoom);

module.exports = router;

