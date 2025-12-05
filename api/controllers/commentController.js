const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post){
      return res.status(404).json({ message: 'Post not found', success: false })
    }

    const comment = new Comment({
      user: req.user.id,
      post: req.params.postId,
      content
    })

    await comment.save();

    res.status(201).json({ message: 'Comment created successfully', comment, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
       .populate('user', 'username email avatar name')
       .sort({ createdAt: -1 });

    res.status(200).json({ comments, success: true, message: 'Comments fetched successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

const getComment = async (req, res) => {
   try {
     const comment = await Comment.findById(req.params.commentId).populate('user', 'username email avatar name');

     if (!comment){
        return res.status(404).json({ message: 'Comment not found', success: false });
     }

     res.status(200).json({ comment, success: true, message: 'Comment fetched successfully' });
   } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message, success: false });
   }
}

const updateComment = async (req, res) => {
   try{
      const { content } = req.body;
  
      const comment = await Comment.findById(req.params.commentId);
  
      if (!comment) {
         return res.status(404).json({ message: 'Comment not found', success: false });
      }

      if (comment.user.toString() !== req.user.id){
         return res.status(401).json({ message: 'Not authorized', success: false });
      }

      comment.content = content || comment.content;
      await comment.save();

      res.status(200).json({ message: 'Comment updated successfully', comment, success: true });
   } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message, success: false });
   }
}

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment){
      return res.status(404).json({ message: 'Comment not found', success: false });
    }

    if (comment.user.toString() !== req.user.id){
      return res.status(401).json({ message: 'Not authorized', success: false });
    }

    await comment.deleteOne();

    res.status(200).json({ message: 'Comment deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found', success: false });
    }

    if (comment.likes.includes(req.user._id)) {
      comment.likes = comment.likes.filter(_id => _id.toString() !== req.user._id.toString());
      comment.likesCount = comment.likes.length;
    }

    comment.likes.push(req.user._id);
    comment.likesCount = comment.likes.length;

    await comment.save();

    res.status(200).json({ message: 'Comment liked successfully', comment, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

module.exports = { createComment, getComments, updateComment, deleteComment, likeComment, getComment }