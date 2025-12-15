const express = require('express');
const { protect } = require('../middleware/auth');
// import contrllers for update name and avatar in one function
const { updateAccountSettings } = require('../controllers/accountSettingController');

const router = express.Router();

router.put('/update', protect, updateAccountSettings);

module.exports = router;