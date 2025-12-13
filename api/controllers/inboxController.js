const User = require('../models/User');
const ChatMetadata = require('../models/ChatMetadata');

const getUsersByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const exactUserPromises = await User.find({
      username: { $regex: `^${username}$`, $options: 'i' }
    }).select('name username avatar').limit(1);

    const exactUser = exactUserPromises.length > 0 ? exactUserPromises[0].toObject() : null;

    if (exactUser) {
      exactUser.exact = true; 
    }

    // Find partial matches
    const excludeFilter = exactUser ? { _id: { $ne: exactUser._id } } : {};
    const partialUsers = await User.find({
      username: { $regex: username, $options: 'i' },
      ...excludeFilter
    })
      .select('name username avatar')
      .limit(exactUser ? 19 : 20)
      .sort({ username: 1 });

    // Prepend the exact match if it exists
    const users = exactUser ? [exactUser, ...partialUsers] : partialUsers;

    res.status(200).json({ users, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('name username avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    res.status(200).json({ user, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
};

const getChatsMetadata = async (req, res) => {
  try {    
    const chats = await ChatMetadata.find({ users: req.user.id }).populate('users', 'name username avatar');

    res.status(200).json({ chats, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

const storeChatMetadata = async (req, res) => {
  try {
    const { users } = req.body;

    const allUsers = [req.user.id, ...users];

    const existingChat = await ChatMetadata.findOne({
      users: { $all: allUsers, $size: allUsers.length }
    });

    if (existingChat) {
      return res.status(200).json({ message: 'Chat already exists', chat: existingChat, success: true });
    }

    const chat = new ChatMetadata({
      users: [req.user.id, ...users],
      slug: `${req.user.id}_${users.join('_')}`
    })

    await chat.save();

    res.status(201).json({ chat, success: true });
  }  catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

const deleteChatMetadata = async (req, res) => {
  try {
    const { slug } = req.params;

    const chat = await ChatMetadata.findOne({ slug });

    if (!chat){
      return res.status(404).json({ message: 'Chat not found', success: false });
    }

    await chat.deleteOne();

    res.status(200).json({ message: 'Chat deleted successfully', success: true });
  }  catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

module.exports = { getUsersByUsername, getChatsMetadata, storeChatMetadata, deleteChatMetadata, getUserById }