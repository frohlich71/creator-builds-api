import { Controller, Post, Body, Get, Param, Delete, Put } from '@nestjs/common';
import { SetupService } from './setup.service';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateSetupDto } from './DTOs/create-setup.dto';

@ApiTags('Setups')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new setup for an user' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateSetupDto })
  async createSetupForUser(
    @Body() createSetupDto: CreateSetupDto,
  ) {
    const { name, ownerName, equipments } = createSetupDto;
    return this.setupService.createForUser(name, ownerName, equipments);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a setup by id' })
  async getSetupById(@Param('id') id: string) {
    return this.setupService.findById(id);
  }

  @Get('user/:userId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all setups for an user' })
  async getSetupsByUser(@Param('userId') userId: string) {
    return this.setupService.findByUserId(userId);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a setup by id' })
  @ApiBody({ type: CreateSetupDto })
  async updateSetupById(
    @Param('id') id: string,
    @Body() updateSetupDto: CreateSetupDto,
  ) {
    const { name, ownerName, equipments } = updateSetupDto;
    return await this.setupService.updateById(id, name, ownerName, equipments);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a setup by id' })
  async deleteSetupById(@Param('id') id: string) {
    return this.setupService.deleteById(id);
  }
}
