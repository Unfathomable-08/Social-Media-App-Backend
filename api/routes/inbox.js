const express = require('express');
const { protect } = require('../middleware/auth');
const { getUsersByUsername, getChatsMetadata, storeChatMetadata, deleteChatMetadata, getUserById } = require('../controllers/inboxController');

const router = express.Router();

router.get('/username/:username', protect, getUsersByUsername);
router.get('/id/:id', protect, getUserById);
router.get('/chats', protect, getChatsMetadata);
router.post('/chats', protect, storeChatMetadata);
router.delete('/chats/:slug', protect, deleteChatMetadata);

module.exports = router;