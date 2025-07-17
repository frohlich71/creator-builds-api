import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface WelcomeEmailData {
  name: string;
  email: string;
}

export interface PasswordResetEmailData {
  name: string;
  resetLink: string;
  email: string;
}

export interface EmailVerificationData {
  name: string;
  email: string;
  verificationCode: string;
  verificationLink: string;
}

@Injectable()
export class EmailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    this.resend = new Resend(apiKey);
    this.defaultFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  }

  async sendEmail(options: EmailOptions) {
    try {
      const emailData = {
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html || undefined,
        text: options.text || options.subject,
      };

      const result = await this.resend.emails.send(emailData);
      
      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Welcome to Creator Builds!</h1>
        <p style="color: #666; font-size: 16px;">Hello ${data.name},</p>
        <p style="color: #666; font-size: 16px;">
          Welcome to our platform! We're so excited to have you with us.
        </p>
        <p style="color: #666; font-size: 16px;">
          You can now start exploring all the available features and create amazing builds.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Access Platform
          </a>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center;">
          If you didn't create this account, you can ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: data.email,
      subject: 'Welcome to Creator Builds!',
      html,
    });
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Reset Password</h1>
        <p style="color: #666; font-size: 16px;">Hello ${data.name},</p>
        <p style="color: #666; font-size: 16px;">
          You requested a password reset. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetLink}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 16px;">
          This link expires in 1 hour for security reasons.
        </p>
        <p style="color: #999; font-size: 14px; text-align: center;">
          If you didn't request this password reset, you can ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: data.email,
      subject: 'Reset your password - Creator Builds',
      html,
    });
  }

  async sendPasswordChangedNotification(email: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Password Changed Successfully</h1>
        <p style="color: #666; font-size: 16px;">Hello ${name},</p>
        <p style="color: #666; font-size: 16px;">
          Your password was successfully changed on ${new Date().toLocaleString('en-US')}.
        </p>
        <p style="color: #666; font-size: 16px;">
          If you didn't make this change, please contact us immediately.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Login
          </a>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center;">
          This is an automated email, please do not reply.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password changed - Creator Builds',
      html,
    });
  }

  async sendEmailVerification(data: EmailVerificationData) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Verify Your Email Address</h1>
        <p style="color: #666; font-size: 16px;">Hello ${data.name},</p>
        <p style="color: #666; font-size: 16px;">
          Thank you for registering with Creator Builds! Please verify your email address to complete your account setup.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; display: inline-block;">
            <p style="color: #333; font-size: 18px; margin: 0; font-weight: bold;">Verification Code:</p>
            <p style="color: #007bff; font-size: 32px; margin: 10px 0; font-weight: bold; letter-spacing: 4px;">${data.verificationCode}</p>
          </div>
        </div>
        <p style="color: #666; font-size: 16px; text-align: center;">
          Or click the button below to verify automatically:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationLink}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 16px;">
          This verification code expires in 24 hours for security reasons.
        </p>
        <p style="color: #999; font-size: 14px; text-align: center;">
          If you didn't create this account, you can ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: data.email,
      subject: 'Verify your email address - Creator Builds',
      html,
    });
  }

  async sendEmailVerificationSuccess(email: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Email Verified Successfully! ✅</h1>
        <p style="color: #666; font-size: 16px;">Hello ${name},</p>
        <p style="color: #666; font-size: 16px;">
          Congratulations! Your email address has been successfully verified.
        </p>
        <p style="color: #666; font-size: 16px;">
          You can now access all features of the Creator Builds platform.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Access Platform
          </a>
        </div>
        <p style="color: #999; font-size: 14px; text-align: center;">
          Welcome to Creator Builds!
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Email verified successfully - Creator Builds',
      html,
    });
  }

  async sendTestEmail(to: string) {
    return this.sendEmail({
      to,
      subject: 'Test Email - Creator Builds',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Test Email</h1>
          <p style="color: #666; font-size: 16px;">
            This is a test email from the Creator Builds platform.
          </p>
          <p style="color: #666; font-size: 16px;">
            If you received this email, the configuration is working correctly!
          </p>
          <p style="color: #999; font-size: 14px; text-align: center;">
            Sent at: ${new Date().toLocaleString('en-US')}
          </p>
        </div>
      `,
      text: 'This is a test email from the Creator Builds platform.',
    });
  }
}
