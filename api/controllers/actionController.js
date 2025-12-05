const Post = require("../models/Post");

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found', success: false });
    }

    if (post.likes.includes(req.user._id)){
      post.likes = post.likes.filter(_id => _id.toString() !== req.user._id.toString());
      post.likesCount = post.likes.length;
      await post.save();
      
      return res.status(200).json({ message: 'Post unliked successfully', post, success: true });
    }

    post.likes.push(req.user._id);
    post.likesCount = post.likes.length;
    await post.save();

    return res.status(200).json({ message: 'Post liked successfully', post, success: true });
    
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

module.exports = { likePost }