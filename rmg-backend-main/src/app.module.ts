import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModule } from './api/api.module';
import { UtilsService } from './utils/utils.service';
import { UtilsModule } from './utils/utils.module';
import { EventEmitterModule } from '@nestjs/event-emitter';



@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:'.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    ApiModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UtilsModule,
    EventEmitterModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService, UtilsService],
})
export class AppModule {}
