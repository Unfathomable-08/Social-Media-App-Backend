const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendVerificationCodeEmail = async (email, code) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Social Media App" <${process.env.SMTP_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Verify Your Email</h1>
        <p>Thank you for signing up! Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4CAF50;">
            ${code}
          </span>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationCodeEmail };