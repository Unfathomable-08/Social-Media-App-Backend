const express = require('express');
const { protect } = require('../middleware/auth');
const { getUsersByUsername } = require('../controllers/inboxController');

const router = express.Router();

router.get('/:username', protect, getUsersByUsername);
// more

module.exports = router;