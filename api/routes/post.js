const express = require('express');
const { protect } = require('../middleware/auth');
const { createPost, getPosts, getPost, updatePost, deletePost, getFeed } = require('../controllers/postController');

const router = express.Router();

router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.get('/:id', protect, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.get('/feed', protect, getFeed);

module.exports = router;