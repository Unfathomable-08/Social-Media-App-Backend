const express = require('express');
const { signup, login, verifyEmail, resendVerification, getMe } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', getMe);

module.exports = router;
