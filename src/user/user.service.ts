import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './DTOs/create-user.dto';
import { SetupService } from 'src/setup/setup.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private setupService: SetupService
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
    
    const createdUser = new this.userModel(createUserDto);

    return createdUser.save();
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
}
