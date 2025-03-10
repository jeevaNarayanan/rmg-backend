import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, Logger, NotFoundException, Req } from '@nestjs/common';
import { CreateEmployeeDto,  SearchEmployeeDto, UpdateEmployerDto } from './dto/create-employer.dto';
import mongoose, {  Types } from 'mongoose';
import { Employee, MySkills } from '../schemas/employee.schema';
import { InjectModel } from '@nestjs/mongoose';
import { generateRandomPassword } from 'src/utils/RandomPassword.util';
import { hash } from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdateEmployerIdDto } from './dto/update-employerId.dto';
import { CreateMySkillDto } from './dto/create-my-skill.dto';
import { Skill } from '../schemas/skill.schema';
import { PaginationResponse } from 'src/utils/search/pagination.response';
import { SearchInputDto } from 'src/utils/search/search.input.dto';
import { FilterMapper } from 'src/utils/search/filter.mapper';
import { PaginationMapper } from 'src/utils/search/pagination.mapper';
import { processInput } from 'src/utils/search/transform.filter';
import { plainToInstance } from 'class-transformer';
import { FieldSetMapper } from 'src/utils/search/fieldset.mapper';
import { Cron } from '@nestjs/schedule';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MyService } from 'src/redis/redis.service';
import { MailService } from '../mail/mail.service';
import { VerifyEmployerOtpDto } from './dto/verify-employer-otp.dto';
import { AuthService } from '../auth/auth.service';
import { SetPasswordDto } from './dto/set-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';



@Injectable()
export class EmployeeService {

  private readonly logger = new Logger(EmployeeService.name);
    constructor(
        @InjectModel(Employee.name)
        private employeeModel: mongoose.Model<Employee>,
        @InjectModel(MySkills.name) 
        private  mySkillModel: mongoose.Model<MySkills>,
        @InjectModel(Skill.name) 
        private  skillModel:mongoose.Model<Skill>,
        private mailService: MailService,
        private readonly eventEmitter: EventEmitter2, 
        private readonly redisService: MyService,
        private authService: AuthService,
    ){}

    
// Cron job to increment experience
@Cron('0 0 1 * *') // Runs at midnight on the 1st day of every month
async incrementExperienceForSkills() {
  this.logger.log('Cron job started: Incrementing skill experience');

  try {
    // Update experience for all employees
    const result = await this.employeeModel.updateMany(
      { 'my_skills.experience': { $exists: true } }, // Check for employees with skills
      {
        $inc: { 'my_skills.$[].experience': 0.1 }, // Increment all skills' experience
      }
    );
    console.log(result)

    this.logger.log(
      `Successfully updated experience for ${result.modifiedCount} employees`
    );
  } catch (error) {
    this.logger.error('Error while incrementing skill experience:', error);
  }
}

// async createEmployee(
//   createEmployeeDto: CreateEmployeeDto,id : string
// ): Promise<any> {
//   try {
//     const adminId = new Types.ObjectId(id);

//     const { email, employer_id } = createEmployeeDto;

//     // Check for duplicate email
//     const existingEmail = await this.employeeModel.findOne({ email }).exec();
//     if (existingEmail) {
//       throw new HttpException(
//         `Email already taken: ${email}`,
//         HttpStatus.BAD_REQUEST,
//       );
//     }

//     // Check for duplicate employer ID
//     const existingEmployer = await this.employeeModel
//       .findOne({ employer_id })
//       .exec();
//     if (existingEmployer) {
//       throw new HttpException(
//         `Employer ID already associated with another employee: ${employer_id}`,
//         HttpStatus.BAD_REQUEST,
//       );
//     }

//     // Generate random password and hash it
//     const randomPassword = generateRandomPassword(8);
//     const hashedPassword = await hash(randomPassword, 10);

//     // Create and save employee
//     const newEmployee = new this.employeeModel({
//       ...createEmployeeDto,
//       password: hashedPassword,
//       password_update_date: new Date(),
//       created_by: new Types.ObjectId(adminId),
//       status: 'active',
//     });

//     const savedEmployee = await newEmployee.save();

//    const  memail =email
//    console.log(memail)
    

//     // Emit event for sending welcome email
//     this.eventEmitter.emit(
//       'event.data.generateWelcomeMail',
//       {
//         email: email,
//         first_name: savedEmployee.first_name,
//         last_name: savedEmployee.last_name,
//       },
//       randomPassword,
//     );

//     // Log the creation action
//     console.log(
//       `Employee ${savedEmployee.first_name} ${savedEmployee.last_name} created `,
//     );

//     return {
//       message: 'Employee Created Successfully',
//       data: savedEmployee,
//       statusCode: HttpStatus.OK,
//     };
//   } catch (error) {
//     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
//   }
// }
async createEmployee(
  createEmployeeDto: CreateEmployeeDto, 
  adminId: string
): Promise<any> {
  console.log(adminId,"Admin")
  try {
    if (!Types.ObjectId.isValid(adminId)) {
      throw new HttpException('Invalid admin ID', HttpStatus.BAD_REQUEST);
    }

    const adminObjectId = new Types.ObjectId(adminId);
    const { email, employer_id } = createEmployeeDto;

    // Check for duplicate email
    const existingEmail = await this.employeeModel.findOne({ email }).exec();
    if (existingEmail) {
      throw new HttpException(
        `Email already taken: ${email}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check for duplicate employer ID
    const existingEmployer = await this.employeeModel.findOne({ employer_id }).exec();
    if (existingEmployer) {
      throw new HttpException(
        `Employer ID already associated with another employee: ${employer_id}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Generate a random password, hash it and set password update date
    const randomPassword = generateRandomPassword(8);
    const hashedPassword = await hash(randomPassword, 10);

    // Create the new employee
    const newEmployee = new this.employeeModel({
      ...createEmployeeDto,
      password: hashedPassword,
      password_update_date: new Date(),
      created_by: adminObjectId,
      status: 'active',
    });

    // Save the new employee
    const savedEmployee = await newEmployee.save();

    // Log the creation action
    console.log(`Employee ${savedEmployee.first_name} ${savedEmployee.last_name} created successfully`);

    // Emit event to send a welcome email
    this.eventEmitter.emit(
      'event.data.generateWelcomeMail',
      {
        email: savedEmployee.email,
        first_name: savedEmployee.first_name,
        last_name: savedEmployee.last_name,
      },
      randomPassword
    );

    return {
      message: 'Employee created successfully',
      data: savedEmployee,
      statusCode: HttpStatus.OK,
    };
  } catch (error) {
    console.error('Error creating employee:', error);
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}




//update employer by admin
// async updateEmployer(
//   updateEmployerDto: UpdateEmployerDto, 
//   id: string, 
//   current_user: any
// ): Promise<any> {
//   try {

//     const admin = new Types.ObjectId(current_user.sub)
//     console.log(admin,"admin")
//     const existingEmployerByEmail = await this.employeeModel.findOne({ email: updateEmployerDto.email }).exec();
//     if (existingEmployerByEmail && existingEmployerByEmail._id.toString() !== id) {
//       throw new HttpException(
//         `Email is already taken by another employer: ${existingEmployerByEmail.email}`,
//         HttpStatus.BAD_REQUEST,
//       );
//     }

//     const existingEmployerById = await this.employeeModel.findOne({ employer_id: updateEmployerDto.employer_id }).exec();
//     if (existingEmployerById && existingEmployerById._id.toString() !== id) {
//       throw new HttpException(
//         `Employer ID already exists: ${existingEmployerById.employer_id}`,
//         HttpStatus.BAD_REQUEST,
//       );
//     }

//     // Update the employer details
//     const updatedEmployer = await this.employeeModel.findByIdAndUpdate(
//       id, 
//       {
//         ...updateEmployerDto, 
//         updated_by: new Types.ObjectId(current_user.sub), 
//         updated_at: new Date(),
//       },
//       { new: true }
//     ).exec();

//     return {
//       message: 'Employer updated successfully',
//       data: updatedEmployer,
//       statusCode: HttpStatus.OK,
//     };

//   } catch (error) {
//     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
//   }
// }

async updateEmployer(
  updateEmployerDto: UpdateEmployerDto, 
  id: string, 
  current_user: any
): Promise<any> {
  try {
    const admin = new Types.ObjectId(current_user.sub);
    console.log(admin, "admin");

    // Check for duplicate email
    const existingEmployerByEmail = await this.employeeModel.findOne({ email: updateEmployerDto.email }).exec();
    if (existingEmployerByEmail && existingEmployerByEmail._id.toString() !== id) {
      throw new HttpException(
        `Email is already taken by another employer: ${existingEmployerByEmail.email}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check for duplicate employer ID
    const existingEmployerById = await this.employeeModel.findOne({ employer_id: updateEmployerDto.employer_id }).exec();
    if (existingEmployerById && existingEmployerById._id.toString() !== id) {
      throw new HttpException(
        `Employer ID already exists: ${existingEmployerById.employer_id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update the employer details
    const updatedEmployer = await this.employeeModel.findByIdAndUpdate(
      id,
      {
        ...updateEmployerDto,
        updated_by: admin,
        updated_at: new Date(),
      },
      { new: true }
    ).exec();

    if (!updatedEmployer) {
      throw new HttpException('Employer not found', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Employer updated successfully',
      data: updatedEmployer,
      statusCode: HttpStatus.OK,
    };

  } catch (error) {
    console.error('Error in service while updating employer:', error);

    // Rethrow the error for the controller to handle
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}


  //delete employee by id
  async deleteEmployerById(employeeId: string) {
    const employee = await this.employeeModel.findByIdAndDelete(employeeId);
  
    if (!employee) {
      throw new Error('Employee not found');
    }
  
    return {
      statusCode: 200,
      message: 'Employee deleted successfully',
    };
  }


//update employer by employee
async updateEmployerById(
  updateEmployerDto: UpdateEmployerIdDto,
  current_user: any
): Promise<any>{
  try {

    console.log(current_user,"current_user")
    const updatedEmployer = await this.employeeModel.findByIdAndUpdate(
      current_user,
      {
        ...updateEmployerDto,
        updated_by: new Types.ObjectId(current_user),
        updated_at: new Date()
      },
      {new: true}
    ).exec();

    return {
      message: 'Employer updated successfully',
      data: updatedEmployer,
      statusCode: HttpStatus.OK,
    };
  } catch (error) {
    console.log("err",error);
    
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  }
}



//create my skill
async createMySkillForUser(
  createMySkillDto: CreateMySkillDto,
  current_user: string
): Promise<any> {
  try {
    console.log(current_user, "current_user");
    
    const skillId =  createMySkillDto.skill_id
    // Create the MySkill document and associate it with the user
    const newMySkill = new this.mySkillModel({
      ...createMySkillDto,
      skill_id : new Types.ObjectId(skillId),
      updated_by: new Types.ObjectId(current_user), // Setting updated_by field
      created_by: new Types.ObjectId(current_user), // Setting created_by field
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedMySkill = await newMySkill.save();

    // Find the skill data to be added
    const skillData = await this.mySkillModel
      .findById(savedMySkill._id)
      .populate({
        path: 'skill_id',
        select: 'name category skill_type',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'skill_type', select: 'value' },
        ],
      })
      .exec();

    // Prepare the MySkills object with full details
    const mySkillObject = {
      skill_id: skillData.skill_id,
      experience: savedMySkill.experience,
      is_active: savedMySkill.is_active,
      created_by: savedMySkill.created_by,
      updated_by: savedMySkill.updated_by,
    };

    // Update the Employer document to include the full skill object in `my_skills`
    await this.employeeModel.findByIdAndUpdate(
      current_user,
      {
        $push: { my_skills: mySkillObject }, // Add the full MySkills object
        updated_at: new Date(),
      },
      { new: true }
    ).exec();

    // Return success response
    return {
      message: 'MySkill created successfully and added to Employer',
      data: skillData,
      statusCode: HttpStatus.CREATED,
    };
  } catch (error) {
    console.error("Error:", error);

    // Handle exceptions and return appropriate error message
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}



//get all my skills  
async getAllMySkillsByEmployerId(current_user: string) {

  const employerId = new Types.ObjectId(current_user)
  const skills = await this.employeeModel
    .findById(employerId)
    .select('my_skills') // Select only the my_skills field
    .populate({
      path: 'my_skills',
      model: 'MySkills',
      populate: {
        path: 'skill_id', // Populate the referenced skill_id in MySkills
        model: 'Skill',
        populate: [
          {
            path: 'category', // Populate the referenced category in Skill
            model: 'Category',
          },
          {
            path: 'skill_type', // Populate the referenced skill_type in Skill
            model: 'Master',
          },
        ],
      },
    })
    .exec();

  if (!skills) {
    throw new NotFoundException(`Employer with ID ${employerId} not found or has no skills.`);
  }

  return skills.my_skills; // Return only the my_skills field
}

//get perticular skill of employer
async getMySkillById(employerId: string, skillId: string) {
  const employerObjectId = new Types.ObjectId(employerId);
  const skillObjectId = new Types.ObjectId(skillId);

  const skill = await this.employeeModel
    .findOne({ _id: employerObjectId, 'my_skills._id': skillObjectId })  // Filter by employer and skill ID
    .select('my_skills')  // Select only the my_skills field
    .populate({
      path: 'my_skills',
      match: { _id: skillObjectId }, // Match the specific skill
      model: 'MySkills',
      populate: {
        path: 'skill_id',  // Populate the referenced skill_id in MySkills
        model: 'Skill',
        populate: [
          {
            path: 'category',  // Populate the referenced category in Skill
            model: 'Category',
          },
          {
            path: 'skill_type',  // Populate the referenced skill_type in Skill
            model: 'Master',
          },
        ],
      },
    })
    .exec();

  if (!skill) {
    throw new NotFoundException(`Skill with ID ${skillId} not found for employer with ID ${employerId}.`);
  }

  return skill.my_skills[0]; // Return the specific skill
}


//get employer by id
async getEmployerById(id: string) {
  const employee = await this.employeeModel
    .findById(id)
    .populate({
      path: 'my_skills',
      model: 'MySkills',
      populate: {
        path: 'skill_id', // Populates the referenced skill_id in MySkills
        model: 'Skill',
        populate: [
          {
            path: 'category', // Populates the referenced category in Skill
            model: 'Category',
          },
          {
            path: 'skill_type', // Populates the referenced skill_type in Skill
            model: 'Master',
          },
        ],
      },
    })
    .exec();

  if (!employee) {
    throw new NotFoundException(`Employee with ID ${id} not found.`);
  }

  return employee;
}

// get all employees
// async getAllEmployees() {
//   const employees = await this.employeeModel
//     .find()
//     .populate({
//       path: 'my_skills',
//       model: 'MySkills',
//       // match: { 
//       //   is_active: { $eq: 'active' },
//       // },
//       match:{
//         is_active: 'active'
//       },
//       populate: {
//         path: 'skill_id', 
//         model: 'Skill',
//         populate: [
//           {
//             path: 'category', 
//             model: 'Category',
//           },
//           {
//             path: 'skill_type',
//             model: 'Master',
//           },
//         ],
//       },
//     })
//     .exec();

//   if (!employees || employees.length === 0) {
//     throw new NotFoundException('No employees found.');
//   }

//   return employees;
// }

///filter - skill
// async getAllEmployees(filterDto: { skill_id?: string }) {
//   const { skill_id } = filterDto;

//   const filter: any = {};

//   // If skill_id is provided, add it to the filter
//   if (skill_id) {
//     // Convert skill_id to ObjectId if it's valid
//     if (Types.ObjectId.isValid(skill_id)) {
//       filter['my_skills.skill_id'] = new Types.ObjectId(skill_id);
//     } else {
//       throw new BadRequestException('Invalid skill_id');
//     }
//   }

//   const employees = await this.employeeModel
//     .find(filter)
//     .populate({
//       path: 'my_skills',
//       model: 'MySkills',
//       match: {
//         is_active: 'active',
//       },
//       populate: {
//         path: 'skill_id',
//         model: 'Skill',
//         populate: [
//           {
//             path: 'category',
//             model: 'Category',
//           },
//           {
//             path: 'skill_type',
//             model: 'Master',
//           },
//         ],
//       },
//     })
//     .exec();

//   if (!employees || employees.length === 0) {
//     throw new NotFoundException('No employees found.');
//   }

//   return employees;
// }

//skill and experience


async getAllEmployees(filterDto: { skill_id?: string; experience?: number;is_active?: string }) {
  const { skill_id, experience,is_active } = filterDto;

  const filter: any = {};

  // If skill_id is provided, add it to the filter
  if (skill_id) {
    if (Types.ObjectId.isValid(skill_id)) {
      filter['my_skills.skill_id'] = new Types.ObjectId(skill_id);
    } else {
      throw new BadRequestException('Invalid skill_id');
    }
  }

  // If experience is provided, add it to the filter
  if (experience !== undefined) {
    filter['my_skills.experience'] = experience;
  }

  if (is_active) {
    filter['is_active'] = is_active;
  }


  const employees = await this.employeeModel
    .find(filter)
    .populate({
      path: 'my_skills',
      model: 'MySkills',
      match: {

        ...(skill_id && { skill_id: new Types.ObjectId(skill_id) }),
        ...(experience !== undefined && { experience }),
        ...(is_active !== undefined && {is_active})

      },
      populate: {
        path: 'skill_id',
        model: 'Skill',
        populate: [
          {
            path: 'category',
            model: 'Category',
          },
          {
            path: 'skill_type',
            model: 'Master',
          },
        ],
      },
    })
    .exec();

  if (!employees || employees.length === 0) {
    throw new NotFoundException('No employees found.');
  }

  return employees;
}



//delete a perticular my skills
async deleteMySkillById(employerId: string, skillId: string) {
  const employerObjectId = new Types.ObjectId(employerId);
  const skillObjectId = new Types.ObjectId(skillId);

  const result = await this.employeeModel
    .updateOne(
      { _id: employerObjectId, 'my_skills._id': skillObjectId },  // Match employer and skill ID
      { $pull: { my_skills: { _id: skillObjectId } } }  // Remove the skill from the my_skills array
    )
    .exec();

  return { message: `Skill with ID ${skillId} has been deleted successfully.` };
}

//update by my skill
async updateMySkillById(
  employerId: string,
  skillId: string,
  updateData: { experience?: number; is_Active?: boolean }
) {
  const employerObjectId = new Types.ObjectId(employerId);
  const skillObjectId = new Types.ObjectId(skillId);

  const result = await this.employeeModel
    .updateOne(
      { _id: employerObjectId, 'my_skills._id': skillObjectId }, // Match employer and skill ID
      { 
        $set: { 
          'my_skills.$.experience': updateData.experience,
          'my_skills.$.is_Active': updateData.is_Active 
        } 
      } // Update specific fields in the matched skill
    )
    .exec();

  if (result.modifiedCount === 0) {
    throw new NotFoundException(`Skill with ID ${skillId} not found for the employer.`);
  }

  return { message: `Skill with ID ${skillId} has been updated successfully.` };
}


//forgot password
async forGotPassword(
  forgotPasswordDto: ForgotPasswordDto,
): Promise<any> {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const employee = await this.employeeModel
    .findOne({ email: forgotPasswordDto.email, is_active: { $nin: ['archived', 'disabled'] } })
    .select('+password')
    .exec();

  if (employee && employee.is_active === 'active' && employee.password) {
    await this.redisService.setResendOtp(employee._id.toString(), otp);
    this.eventEmitter.emit('event.data.forgotPasswordOTP', {
      email: employee.email,
      first_name: employee.first_name,
      last_name: employee.last_name,
      otp,
    });

    return {
      message: "otp sented successfully",
      data: {
         employee
      },
      statusCode: HttpStatus.OK,
    };
  } else if (
    employee &&
    employee.is_active === 'active' &&
    !employee.password
  ) {
    const randomPassword = generateRandomPassword(8);
    const hashedPassword = await hash(randomPassword, 10);
    await this.employeeModel.findByIdAndUpdate(
      employee._id,
      { password: hashedPassword, password_update_date: new Date() },
      { new: true },
    );
    await this.mailService.sendForgetPassword(
      {
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
      },
      otp,
    );
    return {
      message: "Otp sented Successfully",
      data: {
        employee
      },
      statusCode: HttpStatus.OK,
    };
  }  else {
    return {
      message: "Otp sented Successfully",
      data: {
        email: forgotPasswordDto.email,
      },
      statusCode: HttpStatus.OK,
    };
  }
}
//verify forgot password
async verifyForgotPassword(
  verifyEmployerDto: VerifyEmployerOtpDto,
): Promise<any> {
  const redisValue = await this.redisService.getOtpValue(
    verifyEmployerDto._id.toString(),
  );
  if (!redisValue) {
    throw new HttpException(
      'OTP Expired',
      HttpStatus.BAD_REQUEST,
    );
  }

  const employee = await this.employeeModel
    .findById(verifyEmployerDto._id)
    .select('+password');

  if (verifyEmployerDto.token === redisValue) {
    // OTP is correct, proceed with password reset or JWT generation
    const token = await this.authService.generatJwt(
      employee,
      'employee',
      employee.password || '',
    );
    // Optionally delete OTP from Redis
    await this.redisService.deleteOtpValue(verifyEmployerDto._id.toString());

    return {
      message: "OTP Verified Successfully",
      data: {
         employee,
        token
      },
      statusCode: HttpStatus.OK,
    };
  } else {
    throw new HttpException(
      'OTP verification failed',
      HttpStatus.BAD_REQUEST,
    );
  }
}


async setPassword(
  id: string,
  setPasswordDto: SetPasswordDto,
): Promise<any> {
  const password = await hash(setPasswordDto.password, 10);
  const updatedEmployee = await this.employeeModel.findByIdAndUpdate(
    id,
    { password: password, password_update_date: new Date() },
    { new: true, runValidators: true },
  );
  if (!updatedEmployee) {
    throw new HttpException(
      `Employee with ID "${id}" not found`,
      HttpStatus.NOT_FOUND,
    );
  }
  await this.redisService.deleteOtpValue(id);
  return {
    message: "Password Created Successfully",
    data: updatedEmployee,
    statusCode: HttpStatus.OK,
  };
}



async findemployee(id: string): Promise<any> {
  const employee = await this.employeeModel
    .findOne({ _id: id, is_active: { $nin: ['archived', 'disabled'] } })
    .select('+password');
  if (!employee) {
    throw new HttpException(
      'Employee Information not found',
      HttpStatus.NOT_FOUND,
    );
  }
  return employee;
}

async changePassword(
  employeeId: ObjectId,
  changePasswordDto: ChangePasswordDto): Promise<any> {
  const user = await this.employeeModel.findOne({ _id: new ObjectId(employeeId), status: { $nin: ['archived', 'disabled'] } }).select('+password');
  if (!user) {
    throw new HttpException(
      'User Not Found',
      HttpStatus.BAD_REQUEST
    );
  }

  if (user.password) {
    if (!changePasswordDto.currentPassword) {
      throw new BadRequestException('Current password should not be empty')
    }
    const isMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }
  }

  const password = await hash(changePasswordDto.newPassword, 10);
  await this.employeeModel.findByIdAndUpdate(
    employeeId,
    { password: password, password_update_date: new Date() },
    { new: true, runValidators: true },
  );
  return {
    message:'Password Changed Successfully',
    statusCode: HttpStatus.OK
  }
}


//get all active employees
async getActiveEmployees() {
  const is_active = 'active';

  // Create a filter to match employees with is_active: 'active'
  const filter = { is_active };

  // Fetch employees matching the filter
  const employees = await this.employeeModel
    .find(filter)
    .populate({
      path: 'my_skills',
      model: 'MySkills',
      populate: {
        path: 'skill_id',
        model: 'Skill',
        populate: [
          {
            path: 'category',
            model: 'Category',
          },
          {
            path: 'skill_type',
            model: 'Master',
          },
        ],
      },
    })
    .exec();

  if (!employees || employees.length === 0) {
    throw new NotFoundException('No active employees found.');
  }

  return employees;
}

}
