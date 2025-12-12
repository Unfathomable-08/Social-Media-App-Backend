const User = require('../models/User');

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

module.exports = { getUsersByUsername }