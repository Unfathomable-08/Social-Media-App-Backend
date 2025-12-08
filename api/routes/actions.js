const express = require('express');
const { protect } = require('../middleware/auth');
const { likePost } = require('../controllers/actionController');
const { createComment, getComments, getComment, updateComment, deleteComment, likeComment, replyToComment } = require('../controllers/commentController');

const router = express.Router();

router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/comment', protect, createComment);
router.post('/posts/:id/comments/:commentId/reply', protect, replyToComment);
router.get('/posts/:id/comments', protect, getComments);
router.get('/posts/:id/comments/:commentId', protect, getComment);
router.put('/posts/:id/comments/:commentId', protect, updateComment);
router.delete('/posts/:id/comments/:commentId', protect, deleteComment);
router.post('/posts/:id/comments/:commentId/like', protect, likeComment);

module.exports = router;