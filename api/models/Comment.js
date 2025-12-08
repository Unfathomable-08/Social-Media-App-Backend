const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },

  // This makes it a reply to another comment (null/undefined = top-level comment)
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true  // important for performance
  },

  // Keep track of all ancestors for easier threading
  ancestors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  likesCount: {
    type: Number,
    default: 0
  },

  replyCount: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date
  }
});

// Indexes for fast querying
commentSchema.index({ post: 1, createdAt: -1 });        // All comments on a post, newest first
commentSchema.index({ parentComment: 1, createdAt: -1 }); // Replies to a specific comment

// Auto-increment replyCount when a reply is added
commentSchema.pre('save', async function(next){
  if (this.isNew && this.parentComment) {
    await this.constructor.updateOne(
      { _id: this.parentComment },
      { $inc: { replyCount: 1 } }
    );
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Comment', commentSchema);