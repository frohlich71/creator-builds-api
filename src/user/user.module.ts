import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { SetupService } from 'src/setup/setup.service';
import { Setup, SetupSchema } from 'src/setup/schemas/setup.schema';
import { Equipment, EquipmentSchema } from 'src/equipment/schemas/equipment.schema';
import { Product, ProductSchema } from 'src/products/schemas/products.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Setup.name, schema: SetupSchema }]),
    MongooseModule.forFeature([{ name: Equipment.name, schema: EquipmentSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema },]),
  ],
  controllers: [UserController],
  providers: [UserService, SetupService],
})
export class UserModule {}
