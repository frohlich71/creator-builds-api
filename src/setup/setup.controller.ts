import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { SetupService } from './setup.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateSetupDto } from './DTOs/create-setup.dto';

@ApiTags('Setups')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new setup for an user' })
  @ApiBody({ type: CreateSetupDto })
  async createSetupForUser(
    @Body() createSetupDto: CreateSetupDto,
  ) {
    const { name, ownerId, equipments } = createSetupDto;
    return this.setupService.createForUser(name, ownerId, equipments);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all setups for an user' })
  async getSetupsByUser(@Param('userId') userId: string) {
    return this.setupService.findByUserId(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a setup by id' })
  async deleteSetupById(@Param('id') id: string) {
    return this.setupService.deleteById(id);
  }
}
