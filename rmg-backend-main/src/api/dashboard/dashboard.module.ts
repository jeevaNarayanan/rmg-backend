import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Skill, SkillSchema } from '../schemas/skill.schema';
import { Master, MasterSchema } from '../schemas/master.schema';
import { AuthService } from '../auth/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from '../schemas/employee.schema';

@Module({
  imports:[MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema },{ name: Skill.name, schema: SkillSchema },{name: Master.name, schema:MasterSchema},{name: Employee.name, schema:EmployeeSchema}]),],
  providers: [DashboardService,AuthService],
  controllers: [DashboardController]
})
export class DashboardModule {}
