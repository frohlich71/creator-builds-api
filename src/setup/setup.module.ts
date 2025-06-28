import { Module } from '@nestjs/common';
import { SetupService } from './setup.service';
import { SetupController } from './setup.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Setup, SetupSchema } from './schemas/setup.schema';
import {
  Equipment,
  EquipmentSchema,
} from 'src/equipment/schemas/equipment.schema';
import { Product, ProductSchema } from 'src/products/schemas/products.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Setup.name, schema: SetupSchema },
      { name: Equipment.name, schema: EquipmentSchema },
      { name: Product.name, schema: ProductSchema },
      { name: 'User', schema: 'UserSchema' }, // Assuming UserSchema is defined elsewhere
    ]),
  ],
  providers: [SetupService],
  controllers: [SetupController],
})
export class SetupModule {}
