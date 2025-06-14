import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from './DTOs/create-user.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  async getUsers() {
    return this.userService.findAll();
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Retrieve a user by name' })
  async getUserByName(@Param('name') name: string) {
    return this.userService.findByName(name);
  }
}
