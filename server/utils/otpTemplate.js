export const getOtpEmailTemplate = (otpCode, userName = 'User') => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 540px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 32px 28px; color: #334155; line-height: 1.6; font-size: 15px; }
          .otp-box { background: #eff6ff; border: 2px dashed #2563eb; border-radius: 10px; padding: 18px 24px; text-align: center; margin: 28px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; font-family: monospace; display: inline-block; margin-left: 10px; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ChatApp</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Thank you for signing up for ChatApp! To verify your email address and activate your account, please enter the following 6-digit verification code:</p>
            
            <div class="otp-box">
              <span class="otp-code">${otpCode}</span>
            </div>

            <p style="color: #64748b; font-size: 14px;">This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>
            <p style="color: #64748b; font-size: 13px; margin-top: 24px;">If you did not attempt to sign up for ChatApp, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ChatApp. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
};

export default getOtpEmailTemplate;
