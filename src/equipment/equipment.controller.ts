import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEquipmentDto } from './DTOs/create-equipment.dto';

@ApiTags('Equipments')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create equipment for setup' })
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
  @ApiOperation({ summary: 'Delete equipment by id' })
  async deleteEquipmentById(@Param('id') id: string) {
    return this.equipmentService.deleteById(id);
  }
}
