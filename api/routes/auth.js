const express = require('express');
const { signup, login, verifyCode, resendCode, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth')
 
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-code', protect, verifyCode);
router.post('/resend-code', protect, resendCode);
router.get('/me', protect, getMe);

module.exports = router;
