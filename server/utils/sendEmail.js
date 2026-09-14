import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html, text }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error('Email credentials not configured! Please add EMAIL_USER and EMAIL_PASS to server/.env');
    throw new Error('Email service is not configured on the server. Please set EMAIL_USER and EMAIL_PASS in environment variables.');
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: process.env.EMAIL_SECURE === 'true' || true,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"ChatApp" <${emailUser}>`,
    to,
    subject,
    text,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent successfully:', info.messageId);
  return info;
};

export const getPasswordResetTemplate = (resetUrl, userName = 'User') => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 32px 28px; color: #334155; line-height: 1.6; font-size: 15px; }
          .button-wrapper { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .raw-link { word-break: break-all; color: #2563eb; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ChatApp</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>We received a request to reset the password for your account. Click the button below to set a new password:</p>
            <div class="button-wrapper">
              <a href="${resetUrl}" target="_blank" class="btn">Reset My Password</a>
            </div>
            <p>This password reset link is valid for <strong>15 minutes</strong>.</p>
            <p>If you didn't make this request, you can safely ignore this email. Your current password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b;">If the button above doesn't work, copy and paste this URL into your browser:</p>
            <p><a href="${resetUrl}" class="raw-link">${resetUrl}</a></p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ChatApp. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
};

export default sendEmail;
