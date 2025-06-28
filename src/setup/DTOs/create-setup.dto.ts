

import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type CreateEquipmentDTO = {
  name: string;
  asin: string;
}

export class CreateSetupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  ownerName: string;

  @ApiProperty()
  @IsArray()
  equipments: CreateEquipmentDTO[];
}