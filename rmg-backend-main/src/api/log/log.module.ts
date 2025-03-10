import { Module } from '@nestjs/common';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from '../schemas/log.schema';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { Project } from '../schemas/project.schema';

@Module({
  imports: [MongooseModule.forFeature([{name:Log.name,schema: LogSchema},{name:Project.name,schema:Project}])],
  controllers: [LogController],
  providers: [LogService,AuthService,ConfigService]
})
export class LogModule {}
