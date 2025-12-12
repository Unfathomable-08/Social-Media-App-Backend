const User = require('../models/User');

const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password');

    if (!user){
      return res.status(404).json({ message: 'User not found', success: false });
    }

    return res.status(200).json({ user, success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message, success: false });
  }
}

module.exports = { getUserByUsername }