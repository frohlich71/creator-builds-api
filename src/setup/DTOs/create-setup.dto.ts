

import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSetupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  ownerId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  equipments: string[];
}