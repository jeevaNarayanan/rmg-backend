import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { Account, AccountSchema } from '../schemas/account.schema';

@Module({
  imports: [MongooseModule.forFeature([{name:Project.name,schema :ProjectSchema},{name: Account.name,schema:AccountSchema}])],
  providers: [ProjectService,AuthService,ConfigService],
  controllers: [ProjectController]
})
export class ProjectModule {}
