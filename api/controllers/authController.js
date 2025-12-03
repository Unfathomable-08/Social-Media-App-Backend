const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationCodeEmail } = require("../utils/sendEmail");

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
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
      isVerified: true,               // only block if already verified
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? "Email already registered" 
          : "Username already taken" 
      });
    }

    // If unverified account exists -> delete it
    await User.deleteMany({
      $or: [{ email }, { username }],
      isVerified: false,
    });

    // Create user and MARK AS VERIFIED immediately
    const user = await User.create({
      username,
      email,
      password,
      isVerified: true,                    // instantly verified
      verificationCode: undefined,
      verificationCodeExpires: undefined,
    });

    const token = generateToken(user._id);
    res.setHeader("Authorization", `Bearer ${token}`);
    res.setHeader("X-Auth-Token", token);

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: true,
      },
      token,
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== Verify Code Controller ======
exports.verifyCode = async (req, res) => {
  try {
    const { code } = req.body; // code from user input
    const userId = req.user?._id || req.body.userId; // you can pass userId or use auth middleware

    if (!userId && !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId || req.user._id).select(
      "+verificationCode +verificationCodeExpires"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== Resend Code Controller ======
exports.resendCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    const code = generateVerificationCode();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    await sendVerificationCodeEmail(user.email, code);

    res.json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Resend code error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== Login Controller ======
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Validate input
    if (!login || !password) {
      return res.status(400).json({
        message: "Please provide email/username and password",
      });
    }

    // Find user by email OR username
    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });

    // Check if user exists and password is correct
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Block login if email is not verified
    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     message: "Please verify your email first",
    //     needVerification: true,
    //   });
    // }

    const token = generateToken(user._id);

    // Set headers (for API clients)
    res.setHeader("Authorization", `Bearer ${token}`);
    res.setHeader("X-Auth-Token", token);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user?._id);
  res.json({
    user: {
      id: user?._id,
      username: user?.username,
      email: user?.email,
      isVerified: user?.isVerified,
      createdAt: user?.createdAt,
    },
  });
};
