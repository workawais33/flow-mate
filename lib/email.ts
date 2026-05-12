import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendVerificationEmailParams {
  to: string;
  name: string;
  userId: string;
  token: string;
}

export async function sendVerificationEmail({
  to,
  name,
  userId,
  token,
}: SendVerificationEmailParams) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?userId=${userId}&token=${token}`;

  await transporter.sendMail({
    from: `"FlowMate" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to FlowMate!</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
        <p>This link expires in 24 hours.</p>
        <hr />
        <p style="color: #666; font-size: 12px;">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await transporter.sendMail({
    from: `"FlowMate" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to FlowMate!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to FlowMate, ${name}! 🎉</h2>
        <p>Your account has been successfully verified.</p>
        <p>You can now login and start organizing your tasks and habits.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Go to Dashboard
        </a>
        <hr />
        <p style="color: #666; font-size: 12px;">Need help? Contact us at support@flowmate.com</p>
      </div>
    `,
  });
}