const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // If SMTP environment variables are provided, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // Fallback to local development / test account
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 588,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[Mailer] Ethereal test account created for development email preview:', testAccount.user);
  } catch (err) {
    // Fallback stub transporter for offline development
    transporter = {
      sendMail: async (options) => {
        console.log('[Mailer Offline Mode] Email generated:', options);
        return { messageId: 'offline-' + Date.now() };
      },
    };
  }

  return transporter;
}

/**
 * Sends a 6-digit OTP email valid for 5 minutes
 */
async function sendOtpEmail(toEmail, otp) {
  const mail = await getTransporter();

  const mailOptions = {
    from: '"Spotify Clone Security" <security@spotify.local>',
    to: toEmail,
    subject: `Your Spotify Password Reset Code: ${otp}`,
    text: `Your password reset OTP code is ${otp}. This code is valid for 5 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="background-color: #121212; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border-radius: 12px; border: 1px solid #282828;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1DB954; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">Spotify <span style="font-size: 14px; font-weight: normal; color: #b3b3b3;">Clone</span></h1>
        </div>
        <div style="background-color: #181818; padding: 24px; border-radius: 8px; border: 1px solid #333333; text-align: center;">
          <h2 style="font-size: 20px; color: #ffffff; margin-top: 0;">Password Reset Request</h2>
          <p style="font-size: 14px; color: #b3b3b3; line-height: 1.6;">
            We received a request to reset your password. Use the verification code below to complete the process.
          </p>
          <div style="margin: 28px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1DB954; background: #000000; padding: 12px 24px; border-radius: 8px; border: 1px dashed #1DB954; font-family: monospace;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #ff9800; font-weight: bold; margin-bottom: 4px;">
            ⏱️ This OTP code is valid for 5 minutes only.
          </p>
          <p style="font-size: 12px; color: #727272; margin-top: 16px;">
            If you did not request this code, you can safely ignore this email. Your account remains secure.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await mail.sendMail(mailOptions);
    console.log(`[Mailer] OTP email dispatched to ${toEmail}. MessageId: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Mailer Preview URL]: ${previewUrl}`);
      }
    }
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Mailer Error] Failed to send email:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendOtpEmail,
};
