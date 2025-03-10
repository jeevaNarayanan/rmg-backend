import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../schemas/admin.schema';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Skill, SkillSchema } from '../schemas/skill.schema';
import { Master, MasterSchema } from '../schemas/master.schema';
import { Employee, EmployeeSchema } from '../schemas/employee.schema';

@Module({
  imports: [MongooseModule.forFeature([{name:Admin.name,schema :AdminSchema},
    { name: Category.name, schema: CategorySchema },{ name: Skill.name, schema: SkillSchema },{name: Master.name, schema:MasterSchema},{name:Employee.name,schema :EmployeeSchema}]),],
  providers: [AdminService, AuthService,ConfigService],
  controllers: [AdminController]
})
export class AdminModule {}
