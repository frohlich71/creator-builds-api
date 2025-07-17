import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './DTOs/create-user.dto';
import { SetupService } from 'src/setup/setup.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private setupService: SetupService,
    private emailService: EmailService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    createUserDto.password = hashedPassword

    const existingUser = await this.userModel.findOne({
      name: createUserDto.name,
    });

    const existingEmail = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }
    
    // Generate verification code for new user
    const verificationCode = this.generateVerificationCode();
    
    const createdUser = new this.userModel({
      ...createUserDto,
      emailVerificationToken: verificationCode,
      isEmailVerified: false,
      isVerified: false,
    });
    const savedUser = await createdUser.save();

    // Enviar email de verificação (sem bloquear o registro em caso de erro)
    try {
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?email=${savedUser.email}&code=${verificationCode}`;
      
      await this.emailService.sendEmailVerification({
        name: savedUser.name,
        email: savedUser.email,
        verificationCode,
        verificationLink,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Não lançamos o erro para não impedir o registro do usuário
    }

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (user) {
      user.refreshToken = refreshToken;
      return user.save();
    }
    return null;
  }

  async findByName(name: string): Promise<User | null> {
    const user = await this.userModel.findOne({ name }).exec();
    if (!user) {
      return null;
    }

    user.setups = await this.setupService.findByUserId(user._id.toString());
        
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByNameLike(name: string, limit = 10): Promise<Pick<User, '_id' | 'name' | 'email' | 'profileImage'>[]> {
    // Busca usuários cujo nome contenha a string (case insensitive), retorna só campos essenciais
    return this.userModel.find(
      { name: { $regex: name, $options: 'i' } },
      { _id: 1, name: 1, email: 1, profileImage: 1 }
    )
      .limit(limit)
      .exec();
  }

  async update(userId: string, updateData: Partial<CreateUserDto>): Promise<User | null> {
    console.log('Updating user:', userId, updateData);
    
    if (updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    if (updateData.name) {
      const existingUser = await this.userModel.findOne({
        name: updateData.name,
        _id: { $ne: userId }
      });
      if (existingUser) {
        throw new ConflictException('User with this name already exists');
      }
    }

    if (updateData.email) {
      const existingEmail = await this.userModel.findOne({
        email: updateData.email,
        _id: { $ne: userId }
      });
      if (existingEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).exec();
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<User | null> {
    // Busca o usuário pelo ID
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new ConflictException('User not found');
    }

    // Verifica se a senha atual está correta
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    // Gera hash da nova senha
    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Atualiza a senha
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedNewPassword },
      { new: true, runValidators: true }
    ).exec();

    // Enviar notificação de senha alterada (sem bloquear a operação em caso de erro)
    if (updatedUser) {
      try {
        await this.emailService.sendPasswordChangedNotification(
          updatedUser.email,
          updatedUser.name
        );
      } catch (emailError) {
        console.error('Failed to send password changed notification:', emailError);
        // Não lançamos o erro para não impedir a alteração da senha
      }
    }

    return updatedUser;
  }

  // Email verification methods
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
  }

  async sendEmailVerification(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.isEmailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Generate new verification code
      const verificationCode = this.generateVerificationCode();
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?email=${email}&code=${verificationCode}`;

      // Update user with new verification code and expiry
      await this.userModel.findByIdAndUpdate(user._id, {
        emailVerificationToken: verificationCode,
        // Add expiry time (24 hours from now)
        emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }).exec();

      // Send verification email
      await this.emailService.sendEmailVerification({
        name: user.name,
        email: user.email,
        verificationCode,
        verificationLink,
      });

      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, message: 'Failed to send verification email' };
    }
  }

  async verifyEmail(email: string, verificationCode: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.isEmailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      if (user.emailVerificationToken !== verificationCode) {
        return { success: false, message: 'Invalid verification code' };
      }

      // Check if verification code is expired (if you added expiry field)
      if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
        return { success: false, message: 'Verification code has expired' };
      }

      // Update user as verified
      await this.userModel.findByIdAndUpdate(user._id, {
        isEmailVerified: true,
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      }).exec();

      // Send success notification email
      try {
        await this.emailService.sendEmailVerificationSuccess(user.email, user.name);
      } catch (emailError) {
        console.error('Failed to send verification success email:', emailError);
        // Don't fail the verification if email fails
      }

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('Error verifying email:', error);
      return { success: false, message: 'Failed to verify email' };
    }
  }

  async resendEmailVerification(email: string): Promise<{ success: boolean; message: string }> {
    return this.sendEmailVerification(email);
  }
}
