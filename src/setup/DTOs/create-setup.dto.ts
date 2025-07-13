

import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEquipmentDTO {
  @ApiProperty({ description: 'Nome do equipamento' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Apelido personalizado do equipamento', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: 'Modelo do equipamento', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Marca do equipamento', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Link do equipamento', required: false })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ description: 'Ícone do equipamento', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'ASIN do produto (opcional)', required: false })
  @IsOptional()
  @IsString()
  asin?: string;
}

export class CreateSetupDto {
  @ApiProperty({ description: 'Nome do setup' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Nome do dono do setup' })
  @IsString()
  ownerName: string;

  @ApiProperty({ description: 'Lista de equipamentos do setup', type: [CreateEquipmentDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEquipmentDTO)
  equipments: CreateEquipmentDTO[];
}