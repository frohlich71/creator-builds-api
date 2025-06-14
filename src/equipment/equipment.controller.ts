import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEquipmentDto } from './DTOs/create-equipment.dto';

@ApiTags('Equipments')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create equipment for setup' })
  @ApiBearerAuth('access-token')
  @ApiBody({
    schema: {
      example: {
        nickname: 'Camera Primária',
        name: 'Canon R6',
        brand: 'Canon',
        type: 'Camera',
        url: 'https://example.com/image.jpg',
        setupId: '665fb1234abc',
      },
    },
  })
  async createEquipmentForSetup(
    @Body()
    body: CreateEquipmentDto,
  ) {
    return this.equipmentService.createForSetup(body);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete equipment by id' })
  async deleteEquipmentById(@Param('id') id: string) {
    return this.equipmentService.deleteById(id);
  }
}
