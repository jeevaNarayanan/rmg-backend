import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.gaurd';
import { AuthGuard } from '../auth/auth.gaurd';
import { Roles } from '../auth/roles.decorator';
import { DashboardService } from './dashboard.service';


@Controller('dashboard')
@UseGuards(AuthGuard,RolesGuard)
export class DashboardController {
    constructor (private readonly dashboardService: DashboardService) {}

 //admin dashboard tech stack - get count of all
 
 @Roles('admin')
 @Get()
 async getCounts() {
     return await this.dashboardService.getCounts();
 }

 @Roles('admin')
 @Get('category')
 async getCategoryCounts(){
    return await this.dashboardService.getCategoryCounts();
 }

 @Roles('admin')
 @Get('skills')
async getSkillCounts(){
    return await this.dashboardService.getSkillCounts();
}

@Roles('admin')
 @Get('type')
 async getTypeCounts(){
    return await this.dashboardService.getTypeCounts()
 }

 //count of skills under each category
 @Roles('admin')
 @Get('/count-by-category')
    async getSkillCountByCategory() {
        return this.dashboardService.getSkillCountByCategory();
    }

//count of skill under same type
@Roles('admin')
@Get('/count-by-skill-type')
async getSkillCountBySkillType() {
  return this.dashboardService.getSkillCountBySkillType();
}

//active 
@Roles('admin')
@Get('/count-active')
async getActiveEmployeeCount() {
  return this.dashboardService.getActiveEmployeeCount();
}

@Roles('admin')
@Get('/count-disabled')
async getDisabledEmployeeCount() {
  return this.dashboardService.getDisableEmployeeCount();
}

@Roles('admin')
@Get('/count-disabled')
async getArchieveEmployeeCount() {
  return this.dashboardService.getArchievdEmployeeCount();
}
}
