const User = require('../models/User')

const updateAccountSettings = async (req, res) => {
   try {
     const { name, avatar, username } = req.body;

     const user = await User.findById(req.user.id);

     if (!user){
       return res.status(404).json({ message: 'User not found', success: false });
     }

     // if username is provided, check if it is already taken
     if (username){
       const existingUser = await User.findOne({ username });
       if (existingUser && existingUser._id.toString() !== req.user.id){
         return res.status(400).json({ message: 'Username already taken', success: false });
       }
       user.username = username;
     }

     if (name){
       user.name = name;
     }

     if (avatar){
       user.avatar = avatar;
     }

     await user.save();

     res.status(200).json({ message: 'Account settings updated successfully', success: true });
   } catch (error) {
     res.status(500).json({ message: 'Server error', error: error.message, success: false });
   }
}

module.exports = { updateAccountSettings }