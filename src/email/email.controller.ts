import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/constants/metadata';

class SendEmailDto {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

class SendWelcomeEmailDto {
  name: string;
  email: string;
}

class SendPasswordResetEmailDto {
  name: string;
  email: string;
  resetLink: string;
}

class SendEmailVerificationDto {
  name: string;
  email: string;
  verificationCode: string;
  verificationLink: string;
}

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Send a custom email' })
  @ApiBody({ type: SendEmailDto })
  async sendEmail(@Body() emailData: SendEmailDto) {
    try {
      const result = await this.emailService.sendEmail(emailData);
      return {
        success: true,
        message: 'Email sent successfully',
        id: result.data?.id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message,
      };
    }
  }

  @Post('welcome')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Send welcome email to new user' })
  @ApiBody({ type: SendWelcomeEmailDto })
  async sendWelcomeEmail(@Body() welcomeData: SendWelcomeEmailDto) {
    try {
      const result = await this.emailService.sendWelcomeEmail(welcomeData);
      return {
        success: true,
        message: 'Welcome email sent successfully',
        id: result.data?.id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send welcome email',
        error: error.message,
      };
    }
  }

  @Post('password-reset')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiBody({ type: SendPasswordResetEmailDto })
  async sendPasswordResetEmail(@Body() resetData: SendPasswordResetEmailDto) {
    try {
      const result = await this.emailService.sendPasswordResetEmail(resetData);
      return {
        success: true,
        message: 'Password reset email sent successfully',
        id: result.data?.id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send password reset email',
        error: error.message,
      };
    }
  }

  @Post('password-changed')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Send password changed notification' })
  async sendPasswordChangedNotification(
    @Body() data: { email: string; name: string }
  ) {
    try {
      const result = await this.emailService.sendPasswordChangedNotification(
        data.email,
        data.name
      );
      return {
        success: true,
        message: 'Password changed notification sent successfully',
        id: result.data?.id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send password changed notification',
        error: error.message,
      };
    }
  }

  @Get('test')
  @Public()
  @ApiOperation({ summary: 'Send test email - Public endpoint for testing' })
  async sendTestEmail(@Query('email') email: string) {
    if (!email) {
      return {
        success: false,
        message: 'Email parameter is required',
      };
    }

    try {
      const result = await this.emailService.sendTestEmail(email);
      return {
        success: true,
        message: 'Test email sent successfully',
        id: result.data?.id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send test email',
        error: error.message,
      };
    }
  }

  @Post('verification')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Send email verification' })
  @ApiBody({ type: SendEmailVerificationDto })
  async sendEmailVerification(@Body() verificationData: SendEmailVerificationDto) {
    try {
      const result = await this.emailService.sendEmailVerification(verificationData);
      return {
        success: true,
        message: 'Email verification sent successfully',
        id: result.data?.id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send email verification',
        error: error.message,
      };
    }
  }

  @Post('verification-success')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Send email verification success notification' })
  async sendEmailVerificationSuccess(
    @Body() data: { email: string; name: string }
  ) {
    try {
      const result = await this.emailService.sendEmailVerificationSuccess(
        data.email,
        data.name
      );
      return {
        success: true,
        message: 'Email verification success notification sent successfully',
        id: result.data?.id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send email verification success notification',
        error: error.message,
      };
    }
  }
}
