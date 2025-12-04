const express = require('express');
const { protect } = require('../middleware/auth');
const { likePost } = require('../controllers/actionController');

const router = express.Router();

router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/comment', protect, commentPost);
router.post('/posts/:id/share', protect, sharePost);

module.exports = router;