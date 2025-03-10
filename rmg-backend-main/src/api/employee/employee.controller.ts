import { Body, Controller, Delete, Get, HttpException, HttpStatus, InternalServerErrorException, Param, Patch, Post, Put, Req, Res, UseGuards, Query, Headers } from '@nestjs/common';
import { CreateEmployeeDto, SearchEmployeeDto, UpdateEmployerDto } from './dto/create-employer.dto';
import {  Types } from 'mongoose';
import { EmployeeService } from './employee.service';
import { Request } from 'express';
import { Public, Roles, SkipToken } from '../auth/roles.decorator';
import { RequestWithUser } from 'src/utils/interface.utils';
import { RolesGuard } from '../auth/roles.gaurd';
import { AuthGuard } from '../auth/auth.gaurd';
import { UpdateEmployerIdDto } from './dto/update-employerId.dto';
import { CreateMySkillDto } from './dto/create-my-skill.dto';
import { SearchInputDto } from 'src/utils/search/search.input.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyEmployerOtpDto } from './dto/verify-employer-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { MyService } from 'src/redis/redis.service';
import { AuthService } from '../auth/auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetEmployeesFilterDto } from './dto/employee-filter.dto';

@Controller('employee')
@UseGuards(AuthGuard, RolesGuard)

export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService,private readonly redisService: MyService,private authService: AuthService,) {}


    //get all active employess
@Public()
@Get('active-employees')
async getActiveEmployees() {
  return this.employeeService.getActiveEmployees();
}

   @Public()
   @Get('test-cron')
  async testCronJob() {
    return await this.employeeService.incrementExperienceForSkills();
  }

  @Roles('admin')
@Delete(':id')
async deleteSkillById(
  @Param('id') employeeId: string, // Corrected the parameter name from 'employeeId' to 'id' as per the route
) {
  return this.employeeService.deleteEmployerById(employeeId);
}
//get all myskills
// @Roles('employer')
// @Get('skills')
// async getAllMySkills(@Req() request: Request) {
//   const req = request as RequestWithUser;     
//   return this.employeeService.getAllMySkills(req.user.sub);
// }

// get all employees
// @Roles('admin')
// @Get('all')
// async getAllEmployees(
// ){
//   return await this.employeeService.getAllEmployees()
// }

@Public()
@Get()
async getEmployees(@Body() filterDto: GetEmployeesFilterDto) {
  return this.employeeService.getAllEmployees(filterDto);
}







//create myskill
@Roles('employer')
@Post('create')
async createMySkill(
  @Body() createMySkillDto: CreateMySkillDto,
  @Req() request: Request
) {
  const req = request as RequestWithUser;     
  return this.employeeService.createMySkillForUser(createMySkillDto, req.user.sub);
}
  

//create employee
// @Roles('admin')
// @Post(':id')
// async addRecruiters(
//   @Param('id') id: string,
//   @Body() addEmployersDto: CreateEmployeeDto,
// ): Promise<any> {
//   return await this.employeeService.createEmployee(
//     addEmployersDto,
//     id,
//   );
// }
@Roles('admin')
@Post()
async addRecruiters(
  @Req() request: Request,
  @Body() addEmployersDto: CreateEmployeeDto
): Promise<any> {
  try {
    const req = request as RequestWithUser;
    return await this.employeeService.createEmployee(addEmployersDto, req.user.sub);
  } catch (error) {
    console.error('Error in adding employer:', error);
    // Check if the error is an instance of HttpException to extract the message
    if (error instanceof HttpException) {
      throw new HttpException(error.getResponse(), error.getStatus());
    }

    // For other unexpected errors, propagate a generic error message
    throw new HttpException(error.message || 'An unexpected error occurred', HttpStatus.BAD_REQUEST);
  }
}



//delete by employer id
// @Roles('admin')
// @Delete(':id')
// async deleteSkillById(
//   @Param('id') employeeId: string, // Corrected the parameter name from 'employeeId' to 'id' as per the route
// ) {
//   return this.employeeService.deleteEmployerById(employeeId);
// }


//updated by admin
// @Roles('admin')  
// @Put('update-employer/:id')
// async updateEmployer(
//   @Param('id') id: string, 
//   @Body() updateEmployerDto: UpdateEmployerDto, 
//   @Req() request: Request
// ): Promise<any> {
//   const req = request as RequestWithUser;

//   console.log(req.user);  
//   console.log(req.user.sub,"req.user.sub")
//   if (!req.user || !req.user.sub) {
//     throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
//   }
//   return await this.employeeService.updateEmployer(updateEmployerDto, id, req.user);
// }
@Roles('admin')
@Put('update-employer/:id')
async updateEmployer(
  @Param('id') id: string, 
  @Body() updateEmployerDto: UpdateEmployerDto, 
  @Req() request: Request
): Promise<any> {
  const req = request as RequestWithUser;

  console.log(req.user);  
  console.log(req.user.sub, "req.user.sub");
  
  if (!req.user || !req.user.sub) {
    throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  try {
    return await this.employeeService.updateEmployer(updateEmployerDto, id, req.user);
  } catch (error) {
    console.error('Error updating employer:', error);

    // Propagate the exact error message if it is an HttpException
    if (error instanceof HttpException) {
      throw new HttpException(error.getResponse(), error.getStatus());
    }

    // Propagate unexpected errors
    throw new HttpException(error.message || 'An unexpected error occurred', HttpStatus.BAD_REQUEST);
  }
}



//updated by employee
@Roles('employer')
@Put()
async  update(
  @Body() updateEmployerDto : UpdateEmployerIdDto,
  @Req() request: Request): Promise<any> {
    const req = request as RequestWithUser;
    return await this.employeeService.updateEmployerById(updateEmployerDto, req.user.sub)
  }

  
//get all my skills
  @Roles('employer')
  @Get('mySkills')
  async getAllMySkills(@Req() request: Request): Promise<any>{
    const req = request as RequestWithUser;
    return await this.employeeService.getAllMySkillsByEmployerId(req.user.sub)
  }
  
//get perticular myskills
@Roles('employer')
@Get('mySkills/:skillId')
async getMySkillById(@Req() request: Request, @Param('skillId') skillId: string): Promise<any> {
  const req = request as RequestWithUser;
  return await this.employeeService.getMySkillById(req.user.sub, skillId);
}




//get employer by id
@Roles('admin','employer')
@Get(':id')
async getEmployerById(@Param('id') id: string) {
    return await this.employeeService.getEmployerById(id);
}

//delete a perticular myskills
@Roles('employer')
@Delete('mySkills/:skillId')
async deleteMySkillById(@Req() request: Request, @Param('skillId') skillId: string): Promise<any> {
  const req = request as RequestWithUser;
  return await this.employeeService.deleteMySkillById(req.user.sub, skillId);
}

//update myskills
@Roles('employer')
@Patch('mySkills/:skillId')
async updateMySkillById(
  @Req() request: Request, 
  @Param('skillId') skillId: string, 
  @Body() updateData: { experience?: number; is_active?: boolean }
): Promise<any> {
  const req = request as RequestWithUser;
  return await this.employeeService.updateMySkillById(req.user.sub, skillId, updateData);
}

@Public()
  @Post('/forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<any> {
    return await this.employeeService.forGotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('/forgot-password/verify-otp')
  async verifyForgetPassword(
    @Body() verifyEmployerOtpDto: VerifyEmployerOtpDto,
  ): Promise<any> {
    return await this.employeeService.verifyForgotPassword(
      verifyEmployerOtpDto,
    );
  }

  @Public()
  @SkipToken()
  @Put('/password/:id')
  async setPassword(
    @Param('id') id: string,
    @Body() setPasswordDto: SetPasswordDto,
    @Headers('authorization') authorization: string,
  ): Promise<any> {
    const redisValue = await this.redisService.getOtpValue(id);
    const values =
      JSON.parse(redisValue) ||
      (await this.employeeService.findemployee(id));
    await this.authService.verifyUserToken(
      authorization,
      values.Authorization || values.password,
    );
    return await this.employeeService.setPassword(id, setPasswordDto);
  }

//change password
@Roles('employer')
@Put('password')
async changePassword(
  @Body() changePasswordDto: ChangePasswordDto,
  @Req() request: Request,
): Promise<any> {
  const req = request as RequestWithUser;
  const candidateId = req.user.sub;
  return await this.employeeService.changePassword(candidateId, changePasswordDto)
}




}




