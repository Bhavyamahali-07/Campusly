import nodemailer from 'nodemailer';

// Configure standard nodemailer transporter
// In production, use real SMTP credentials.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass',
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@campushub.edu',
    to: email,
    subject: 'Your Password Reset OTP - CampusHub',
    text: `Your OTP for resetting your password is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px;">
        <h2>Password Reset</h2>
        <p>You requested a password reset. Here is your One-Time Password (OTP):</p>
        <h1 style="background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    // If we don't have real SMTP configured, just log it for development purposes
    if (!process.env.SMTP_HOST) {
      console.log('=======================================');
      console.log(`DEVELOPMENT MODE: Simulated Email Sent`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`OTP: ${otp}`);
      console.log('=======================================');
      return true;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
