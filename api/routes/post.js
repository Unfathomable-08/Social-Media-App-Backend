const express = require('express');
const { protect } = require('../middleware/auth');
const { createPost, getPosts, getPost, updatePost, deletePost, getFeed } = require('../controllers/postController');

const router = express.Router();

router.get('/feed', protect, getFeed);
router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.get('/:id', protect, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;