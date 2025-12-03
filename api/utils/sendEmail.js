const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationCodeEmail = async (email, code) => {
  const htmlContent = `
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
  `;

  await resend.emails.send({
    from: `"Social Media App" <${process.env.EMAIL_USER || 'onboarding@resend.dev'}>`,
    to: email,
    subject: "Your Verification Code",
    html: htmlContent,
  });
};

module.exports = { sendVerificationCodeEmail };
