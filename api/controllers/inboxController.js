const User = require('../models/User');
const ChatMetadata = require('../models/ChatMetadata');

// get all users (name, pfp, username) that has similar username to the one provided
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

// get stored metadata of chats to show on inbox screen
const getChatsMetadata = async (req, res) => {
  try {    
    const chats = await ChatMetadata.find({ users: req.user.id }).populate('users', 'name username avatar');

    res.status(200).json({ chats, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

// stor metadata of a new chat
const storeChatMetadata = async (req, res) => {
  try {
    const { users } = req.body;

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

// delete metadata of a chat
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

module.exports = { getUsersByUsername, getChatsMetadata, storeChatMetadata, deleteChatMetadata }