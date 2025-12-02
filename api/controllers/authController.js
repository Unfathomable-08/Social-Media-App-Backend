// controllers/authController.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationCodeEmail } = require('../utils/sendEmail');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper to generate 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 100000-999999
};

// ====== SignUp Controller ======
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email && existingUser.isVerified) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.username === username && existingUser.isVerified) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Re-use unverified account
      const code = generateVerificationCode();
      existingUser.verificationCode = code;
      existingUser.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 min
      if (password) existingUser.password = password;

      await existingUser.save();

      // Send code (fire-and-forget)
      sendVerificationCodeEmail(email, code).catch((err) =>
        console.error('Email sending failed:', err)
      );

      const token = generateToken(existingUser._id);
      res.setHeader('Authorization', `Bearer ${token}`);
      res.setHeader('X-Auth-Token', token);

      return res.status(200).json({
        message: 'Unverified account found. A new verification code has been sent.',
        user: {
          id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
          isVerified: false,
        },
      });
    }

    // New user
    const code = generateVerificationCode();

    const user = await User.create({
      username,
      email,
      password,
      verificationCode: code,
      verificationCodeExpires: Date.now() + 10 * 60 * 1000, // 10 min
    });

    sendVerificationCodeEmail(email, code).catch((err) =>
      console.error('Email sending failed:', err)
    );

    const token = generateToken(user._id);
    res.setHeader('Authorization', `Bearer ${token}`);
    res.setHeader('X-Auth-Token', token);

    res.status(201).json({
      message: 'Verification code sent to your email.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: false,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ====== Verify Code Controller ======
exports.verifyCode = async (req, res) => {
  try {
    const { code } = req.body; // code from user input
    const userId = req.user?._id || req.body.userId; // you can pass userId or use auth middleware

    if (!userId && !req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId || req.user._id).select('+verificationCode +verificationCodeExpires');

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====== Resend Code Controller ======
exports.resendCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    const code = generateVerificationCode();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    await sendVerificationCodeEmail(user.email, code);

    res.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====== Login Controller ======
// ====== Login Controller (Email OR Username) ======
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Validate input
    if (!login || !password) {
      return res.status(400).json({
        message: 'Please provide email/username and password',
      });
    }

    // Find user by email OR username
    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });

    // Check if user exists and password is correct
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Block login if email is not verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email first',
        needVerification: true,
      });
    }

    const token = generateToken(user._id);

    // Set headers (for API clients)
    res.setHeader('Authorization', `Bearer ${token}`);
    res.setHeader('X-Auth-Token', token);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
      token, // optional: include in body too for convenience
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
  });
};