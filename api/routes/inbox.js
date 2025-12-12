const express = require('express');
const { protect } = require('../middleware/auth');
const { getUserByUsername } = require('../controllers/inboxController');

const router = express.Router();

router.get('/:username', protect, getUserByUsername);
// more

module.exports = router;