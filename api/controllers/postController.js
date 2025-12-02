const Post = require("../models/Post");
const User = require("../models/User");

const createPost = async (req, res) => {
  try {
    const { content, image, isPublic } = req.body;

    const post = new Post({
      user: req.user.id,
      content,
      image,
      isPublic,
    });
    await post.save();
    res
      .status(201)
      .json({ message: "Post created successfully", post, success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: error.message, success: false });
  }
};

const getPosts = async (req, res) => {
  // with params
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
  } = req.query;

  try {
    const posts = await Post.find({ user: req.user.id })
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "username email")
      .exec();

    // total posts count
    const totalPosts = await Post.countDocuments({ user: req.user.id });

    res.status(200).json({
      posts,
      success: true,
      message: "Posts fetched successfully",
      pagination: {
        count: posts.length,
        page: parseInt(page),
        limit: parseInt(limit),
        total: Math.ceil(totalPosts / limit),
      },
    });
    
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: error.message, success: false });
  }
};

const getPost = async (req, res) => {
   try {      
     const post = await Post.findById(req.params.id).populate('user', 'username email');
      if (!post) {
         return res.status(404).json({ message: 'Post not found', success: false });
      }

     res.status(200).json({ post, success: true, message: 'Post fetched successfully' });
   } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message, success: false });
   }
}

const updatePost = async (req, res) => {
  try {
    const { content, image, isPublic } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post){
       return res.status(404).json({ message: 'Post not found', success: false });
    }

    if (post.user.toString() !== req.user.id){
       return res.status(401).json({ message: 'Not authorized', success: false });
    }

    post.content = content || post.content;
    post.image = image || post.image;
    post.isPublic = isPublic || post.isPublic;
    post.updatedAt = Date.now();
    await post.save();

    res.status(200).json({ message: 'Post updated successfully', post, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

const deletePost = async (req, res) => {
   try {
     const post = await Post.findById(req.params.id);
     if (!post){
        return res.status(404).json({ message: 'Post not found', success: false });
     }

     if (post.user.toString() !== req.user.id){
        return res.status(401).json({ message: 'Not authorized', success: false });
     }

     await post.deleteOne();

     res.status(200).json({ message: 'Post deleted successfully', success: true });
   } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message, success: false });
   }
}

const getFeed = async (req, res) => {
   try {
    const posts = await Post.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('user', 'username email')
      .exec()

     res.status(200).json({ posts, success: true, message: 'Feed fetched successfully' });
   } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message, success: false });
   }
}

// const searchPosts = async (req, res) => {}

module.exports = { createPost, getPosts, getPost, updatePost, deletePost, getFeed }