import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { SetupModule } from './setup/setup.module';
import { EquipamentModule } from './equipment/equipament.module';

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error('MONGO_URI não está definida');
}

@Module({
  imports: [
    MongooseModule.forRoot(mongoUri),
    UserModule,
    SetupModule,
    EquipamentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
