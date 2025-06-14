import { Module } from '@nestjs/common';
import { SetupService } from './setup.service';
import { SetupController } from './setup.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Setup, SetupSchema } from './schemas/setup.schema';
import {
  Equipment,
  EquipmentSchema,
} from 'src/equipment/schemas/equipment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Setup.name, schema: SetupSchema },
      { name: Equipment.name, schema: EquipmentSchema },
    ]),
  ],
  providers: [SetupService],
  controllers: [SetupController],
})
export class SetupModule {}
