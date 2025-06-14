import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './DTOs/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
      throw new Error('User already exists');
    }

    if (existingEmail) {
      throw new Error('Email already in use');
    }
    
    const createdUser = new this.userModel(createUserDto);

    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findByName(name: string): Promise<User | null> {
    return this.userModel.findOne({ name }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
