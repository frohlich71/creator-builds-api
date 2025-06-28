import { Controller, Post, Body, Get, Param, Query, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './DTOs/create-user.dto';
import { Public } from 'src/constants/metadata';

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
  @ApiBearerAuth('access-token')
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
}
