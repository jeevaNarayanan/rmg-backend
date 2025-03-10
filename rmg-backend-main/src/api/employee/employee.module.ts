import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema, MySkills, MySkillsSchema } from '../schemas/employee.schema';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { MailModule } from '../mail/mail.module';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { Skill, SkillSchema } from '../schemas/skill.schema';
import { MyService } from 'src/redis/redis.service';


@Module({
  imports: [MongooseModule.forFeature([{name:Employee.name,schema :EmployeeSchema},{name:MySkills.name, schema: MySkillsSchema},{ name: Skill.name, schema: SkillSchema },
  ]),
  AuthModule,
  HttpModule,
  MailModule,
 ],
  
  providers: [EmployeeService, ConfigService, AuthService,MyService],
  controllers: [EmployeeController]
})
export class EmployeeModule {}
