const User = require('../models/User');

// get all users (name, pfp, username) that has similar username to the one provided
const getUsersByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const users = await User.find({ username: { $regex: username, $options: 'i' } }).select('name username avatar').limit(20);
    res.status(200).json({ users, success: true });
  }
  catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

module.exports = { getUsersByUsername }