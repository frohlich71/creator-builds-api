
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jtw.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SetupService } from 'src/setup/setup.service';
import { Setup, SetupSchema } from 'src/setup/schemas/setup.schema';
import { Equipment, EquipmentSchema } from 'src/equipment/schemas/equipment.schema';
import { Product, ProductSchema } from 'src/products/schemas/products.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Setup.name,
        schema: SetupSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Equipment.name,
        schema: EquipmentSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      }
    ]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UserService, SetupService ,AuthService, LocalStrategy , JwtStrategy, {provide: APP_GUARD, useClass: JwtAuthGuard}],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
