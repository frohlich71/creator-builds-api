import { Controller, Post, Body, Get, Param, Query, Put, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './DTOs/create-user.dto';
import { UpdateCurrentPasswordDto } from './DTOs/update-current-password.dto';
import { Public } from 'src/constants/metadata';
import { SendEmailVerificationDto, VerifyEmailDto, ResendVerificationDto } from './DTOs/email-verification.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @Public()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retrieve all users' })
  async getUsers() {
    return this.userService.findAll();
  }

  @Get('name/:name')
  @Public()
  @ApiOperation({ summary: 'Retrieve a user by name' })
  async getUserByName(@Param('name') name: string) {
    return this.userService.findByName(name);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by name for combobox' })
  @Public()
  async searchByName(
    @Query('q') q: string,
    @Query('limit') limit?: string
  ) {
    if (!q || q.length < 2) return [];
    const lim = limit ? parseInt(limit, 10) : 10;
    return this.userService.findByNameLike(q, lim);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiBody({ type: CreateUserDto })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Post('update-password')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update current user password' })
  @ApiBody({ type: UpdateCurrentPasswordDto })
  async updateCurrentPassword(
    @Request() req: any,
    @Body() updatePasswordDto: UpdateCurrentPasswordDto
  ) {
    const userId: string = req.user.userId; 
    const { currentPassword, newPassword } = updatePasswordDto;
    const updatedUser = await this.userService.updatePassword(userId, currentPassword, newPassword);
    
    if (updatedUser) {
      return {
        message: 'Password updated successfully',
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          nickname: updatedUser.nickname,
          email: updatedUser.email
        }
      };
    }
    
    return { message: 'Password update failed' };
  }

  @Post('send-verification')
  @Public()
  @ApiOperation({ summary: 'Send email verification code' })
  @ApiBody({ type: SendEmailVerificationDto })
  async sendEmailVerification(@Body() sendVerificationDto: SendEmailVerificationDto) {
    const result = await this.userService.sendEmailVerification(sendVerificationDto.email);
    return result;
  }

  @Post('verify-email')
  @Public()
  @ApiOperation({ summary: 'Verify email address with code' })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const result = await this.userService.verifyEmail(
      verifyEmailDto.email,
      verifyEmailDto.code
    );
    return result;
  }

  @Post('resend-verification')
  @Public()
  @ApiOperation({ summary: 'Resend email verification code' })
  @ApiBody({ type: ResendVerificationDto })
  async resendEmailVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    const result = await this.userService.resendEmailVerification(resendVerificationDto.email);
    return result;
  }

  @Get('verification-status/:email')
  @Public()
  @ApiOperation({ summary: 'Check email verification status' })
  async checkEmailVerificationStatus(@Param('email') email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    return {
      success: true,
      isEmailVerified: user.isEmailVerified,
      isVerified: user.isVerified,
    };
  }
}
