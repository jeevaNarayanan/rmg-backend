import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Admin } from '../schemas/admin.schema';
import * as  mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LoginAdminDto } from './dto/login-admin.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '../schemas/category.schema';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skill } from '../schemas/skill.schema';
import { Types } from 'mongoose';
import { UpdateSkillsDto } from './dto/update-skills.dto';
import { CreateFrameworkDto } from './dto/create-framwork.dto';
import { UpdateFrameworkDto } from './dto/update-framework.dto';
import { CreateMasterDto, UpdateMasterDto } from './dto/create-master.dto';
import { Master } from '../schemas/master.schema';
import { Employee } from '../schemas/employee.schema';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationMapper } from 'src/utils/search/pagination.mapper';
import { SearchInputDto } from 'src/utils/search/search.input.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Admin.name)
        private adminModel: mongoose.Model<Admin>,
        @InjectModel(Category.name)
        private categoryModel:mongoose.Model<Category>,
        @InjectModel(Skill.name)
        private skillModel:mongoose.Model<Skill>,
        @InjectModel(Master.name)
        private masterModel: mongoose.Model<Master>,
        @InjectModel(Employee.name)
        private employeeModel: mongoose.Model<Employee>,
        private readonly authService: AuthService,
        private configService: ConfigService,
    ){}
    

    //Login 
    // async login(loginAdminDto: LoginAdminDto): Promise<any> {
    //     const admin: Admin = await this.adminModel
    //       .findOne({ email: loginAdminDto.email, is_active: 'active' })
    //       .select('+password');
    //     if (!admin) {
    //       throw new HttpException(
    //         'Invalid Email Or Password',
    //         HttpStatus.NOT_FOUND,
    //       );
    //     }
  
    //     const validPassword: boolean = await bcrypt.compare(
    //         loginAdminDto.password,
    //         admin?.password,
    //     );
    
    //     if (!validPassword) {
    //       throw new HttpException(
    //         'Invalid Email Or Password',
    //         HttpStatus.BAD_REQUEST,
    //       );
    //     };
    //     console.log(this.configService.get('jwt'));
        
    //     const token = await this.authService.generatJwt(
    //       admin,
    //       'admin',
    //       process.env.JWT_SECRET,
    //     );
    //     return {
    //       message:'Sucessfully LogedIn',
    //       data: {
    //         ...token,
    //       },
    //       statusCode: HttpStatus.OK,
    //     };
    //   }

    async login(loginAdminDto: LoginAdminDto): Promise<any> {
      // Check in Admin collection
      const admin: Admin | null = await this.adminModel
          .findOne({ email: loginAdminDto.email, is_active: 'active' })
          .select('+password');
  
      let user: Admin | Employee | null = admin; // Union type for both Admin and Employee
      let userType = 'admin'; // To identify user type
  
      console.log(user,"user")

      if (!admin) {
          // If Admin not found, check in Employee collection
          const employer: Employee | null = await this.employeeModel
              .findOne({ email: loginAdminDto.email, is_active: 'active' })
              .select('+password');
          user = employer;
          userType = 'employer';
      }
  
      if (!user) {
          throw new HttpException(
              'Invalid Email Or Password',
              HttpStatus.NOT_FOUND,
          );
      }
  
      // Validate password
      const validPassword: boolean = await bcrypt.compare(
          loginAdminDto.password,
          user.password,
      );
  
      if (!validPassword) {
          throw new HttpException(
              'Invalid Email Or Password',
              HttpStatus.BAD_REQUEST,
          );
      }
  
      // Generate JWT Token
      const token = await this.authService.generatJwt(
          user,
          userType,
          process.env.JWT_SECRET,
      );
  
      return {
          message: 'Successfully Logged In',
          data: {
              ...token,
             role: userType
          },
          statusCode: HttpStatus.OK,
      };
  }
  


      //create category
      async createCategory(createCategoryDto: CreateCategoryDto): Promise<any> {
        try{
          const { name } = createCategoryDto;
      
          // Check if the name field is provided
          if (!name || !name.trim()) {
            throw new BadRequestException('The "Category Name" field is required.');
          }
        
          // Check if the category code field is provided
          // if (!category_code || !category_code.trim()) {
          //   throw new BadRequestException('The "Category Code" field is required.');
          // }
        
          // Normalize the name and category code
          const normalizedName = name.trim().toUpperCase();
          // const normalizedCode = category_code.trim().toUpperCase();
        
          // Check if the category name already exists in the database
          const existingCategoryByName = await this.categoryModel.findOne({ name: normalizedName });
        
          if (existingCategoryByName) {
            throw new ConflictException(`Category with name "${normalizedName}" already exists.`);
          }
        
          // Check if the category code already exists in the database
          // const existingCategoryByCode = await this.categoryModel.findOne({ category_code: normalizedCode });
        
          // if (existingCategoryByCode) {
          //   throw new ConflictException(`Category with code "${normalizedCode}" already exists.`);
          // }
        
          // If not exists, proceed to create a new category
          const categoryData = {
            ...createCategoryDto,
            name: normalizedName, // Use the normalized name
            // category_code: normalizedCode, // Use the normalized code
          };
        
          const category = new this.categoryModel(categoryData);
          return await category.save();
        } catch (err) {
          console.error("Error in createCategory:", err);
      
          // If it's a known NestJS exception, rethrow it directly
          if (err instanceof HttpException) {
            throw err;
          }
      
          // Otherwise, log and wrap unknown errors
          throw new BadRequestException('An unexpected error occurred.');
        }
      }
      
  //update category
  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<any> {
    const { name, ...rest } = updateCategoryDto;
  
    // Fetch the current category to compare values
    const currentCategory = await this.categoryModel.findById(id);
    if (!currentCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
  
    // Normalize the name if provided
    let normalizedName;
    if (name) {
      normalizedName = name.trim().toUpperCase();
  
      // Check if another category with the same name already exists
      const existingCategoryByName = await this.categoryModel.findOne({
        name: normalizedName,
        _id: { $ne: id }, // Exclude the current category being updated
      });
  
      if (existingCategoryByName) {
        throw new ConflictException(`Category with name "${normalizedName}" already exists.`);
      }
    }
  
    // Normalize the category code if provided and it differs from the current value
    let normalizedCode;
    // if (category_code && category_code.trim().toUpperCase() !== currentCategory.category_code) {
    //   // normalizedCode = category_code.trim().toUpperCase();
  
    //   // Check if another category with the same code already exists
    //   const existingCategoryByCode = await this.categoryModel.findOne({
    //     category_code: normalizedCode,
    //     _id: { $ne: id }, // Exclude the current category being updated
    //   });
  
    //   if (existingCategoryByCode) {
    //     throw new ConflictException(`Category with code "${normalizedCode}" already exists.`);
    //   }
    // }
    // Update the category
    const updatedData: any = { ...rest };
    if (normalizedName) {
      updatedData.name = normalizedName;
    }
    // if (normalizedCode) {
    //   updatedData.category_code = normalizedCode;
    // }
  
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true } // Return the updated document
    );
  
    // Return success message with updated category data
    return {
      statusCode: 200,
      message: 'Category Updated Successfully',
      data: updatedCategory,
    };
  }

  //get category by Id
  async getCategoryById(id: string): Promise<any> {
    // Find the category by ID
    const category = await this.categoryModel.findById(id);
  
    // Throw an error if the category is not found
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
  
    // Return the category with a success message
    return {
      statusCode: 200,
      message: 'Category Retrieved Successfully',
      data: category,
    };
  }


//get all categories
//   async getAllCategories(): Promise<any> {
//   // Fetch all categories without any pagination or filtering
//    try{ 
//     const categories = await this.categoryModel.find();

//   // Return the categories with a success message
//   return {
//     statusCode: 200,
//     message: 'Categories Retrieved Successfully',
//     data: categories,
//   };
// } catch(error){
//   throw new Error(error)
// }
// }
async getAllCategories(Query: SearchInputDto): Promise<any> {
  try {
    // Map pagination parameters
    const pagination = PaginationMapper(Query);
    const { page, skip, take } = pagination;

    // Create a search filter object
    const searchFilter: any = {
      skip,
    };

    // Add pagination to the query (skip and limit)
    const categories = await this.categoryModel.find()
      .skip(skip)
      .limit(take);

    // Get the total count of categories for pagination
    const totalCount = await this.categoryModel.countDocuments();

    // Prepare response data
    const send_data = {
      data: categories,
      total: totalCount,
      pagination: { page, skip, take },
    };

    return {
      statusCode: 200,
      message: 'Categories Retrieved Successfully',
      data: send_data,
    };
  } catch (error) {
    return {
      message: "Failed to get categories",
      error: error.message,
      statusCode: 400,
    };
  }
}

//delete category by id
// async deleteCategory(id: string): Promise<any> {
//   const deletedCategory = await this.categoryModel.findByIdAndDelete(id);

//   // Check if the category exists
//   if (!deletedCategory) {
//     throw new NotFoundException(`Category not found.`);
//   }

//   return {
//     statusCode: 200,
//     message: `Category has been deleted successfully.`,
//   };
// }
async deleteCategory(id: string): Promise<any> {
  // Step 1: Check if the category exists
  try 
  {
    const category = await this.categoryModel.findById(id);
  if (!category) {
    throw new NotFoundException(`Category not found.`);
  }

  // Step 2: Check if the category is associated with any skill
  const relatedSkills = await this.skillModel.find({ category: id });
  console.log(relatedSkills,"relatedSkills")

  // Step 3: Check if any skill under this category is linked in MySkills
  const skillIds = relatedSkills.map(skill => skill._id);
  console.log(skillIds,"skillIds")
  const linkedMySkills = await this.employeeModel.find({
    "my_skills.skill_id": { $in: skillIds },
  });
  console.log(linkedMySkills,"linkedMySkills")

  if (linkedMySkills.length > 0) {
    throw new ConflictException(
      `Cannot delete category. Skills under this category are associated with ${linkedMySkills.length} employee(s).`
    );
  }

  // Step 4: Proceed with deletion
  await this.categoryModel.findByIdAndDelete(id);

  return {
    statusCode: 200,
    message: `Category has been deleted successfully.`,
  };
}catch (error) {
  throw new ConflictException(error.message);
}
}



 
  // Delete all categories
  async deleteAllCategories(): Promise<any> {
    const result = await this.categoryModel.deleteMany({});

    // Check if any categories were deleted
    if (result.deletedCount === 0) {
      throw new NotFoundException('No categories found to delete.');
    }

    return {
      statusCode: 200,
      message: 'All categories have been deleted successfully.',
    };
  }

  //create Skill
  async createSkills(createSkillDto: CreateSkillDto): Promise<any> {
    const { name, skills_code, category,  version, skill_type } = createSkillDto;
  
    // Check if the name field is provided
    if (!name || !name.trim()) {
      throw new BadRequestException('The "Skill Name" field is required.');
    }
  
    // Check if the skills_code field is provided
    if (!skills_code || !skills_code.trim()) {
      throw new BadRequestException('The "Skill Code" field is required.');
    }
  
    // Normalize the name and skills_code
    const normalizedName = name.trim().toLowerCase();
    const normalizedCode = skills_code.trim().toLowerCase();
  
    // Check if a skill with the same name already exists in the database
    const existingSkillByName = await this.skillModel.findOne({ name: normalizedName });
  
    if (existingSkillByName) {
      throw new ConflictException(`Skill with name "${normalizedName}" already exists.`);
    }
  
    // Check if a skill with the same code already exists in the database
    const existingSkillByCode = await this.skillModel.findOne({ skills_code: normalizedCode });
  
    if (existingSkillByCode) {
      throw new ConflictException(`Skill with code "${normalizedCode}" already exists.`);
    }
  
    // Validate and convert category to ObjectId
    const categoryObjectId = category ? new Types.ObjectId(category) : null;

    //validate and convert skill_type to objectId
    const skillTypeObjectId = skill_type ? new Types.ObjectId(skill_type) : null;
  
    // Create a new skill document
    const skillData = {
      name: normalizedName, // Use the normalized name
      skills_code: normalizedCode, // Use the normalized code
      is_Active:true,
      category: categoryObjectId,
      version,
      skill_type: skillTypeObjectId
    };
    console.log(skillData)
  
    const newSkill = new this.skillModel(skillData);
    newSkill.save();

    return {
      statusCode: 200,
      message: 'Skills Created Successfully',
      data: newSkill
    }
  }


  //get skill by id
  async getSkillById(skillId: string): Promise<any> {
    try {
      // Validate the provided skill ID
      if (!Types.ObjectId.isValid(skillId)) {
        throw new BadRequestException('Invalid Skill ID.');
      }
  
      // Find the skill by ID and populate the category details
      const skill = await this.skillModel
        .findById(skillId)
        .populate('category')
        .populate('skill_type')
        .exec();
  
      // Check if the skill exists
      if (!skill) {
        throw new NotFoundException(`Skill with ID "${skillId}" not found.`);
      }

      return {
        statusCode: 200,
        message:'Skill Retrieved Successfully',
        data: skill
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  
  // async getAllSkills(): Promise<any> {
  //   try {
  //     // Fetch all skills and populate category details
  //     const skills = await this.skillModel
  //       .find()
  //       .populate('category')
  //       .populate('skill_type')
  //       .exec();
  
  //     // Check if skills are found
  //     if (!skills || skills.length === 0) {
  //       throw new NotFoundException('No skills found.');
  //     }
  
  //     // Structure the response
  //     return {
  //       statusCode: 200,
  //       message: 'Skills Retrieved Successfully',
  //       data: skills,
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }
  async getAllSkills(Query: SearchInputDto): Promise<any> {
    try {
      // Map pagination parameters
      const pagination = PaginationMapper(Query);
      const { page, skip, take } = pagination;
  
      // Add pagination to the query (skip and limit)
      const skills = await this.skillModel
        .find()
        .skip(skip)
        .limit(take)
        .populate('category')
        .populate('skill_type')
        .exec();
  
      // Get the total count of skills for pagination
      const totalCount = await this.skillModel.countDocuments();
  
      // Check if skills are found
      if (!skills || skills.length === 0) {
        throw new NotFoundException('No skills found.');
      }
  
      // Prepare response data
      const send_data = {
        data: skills,
        total: totalCount,
        pagination: { page, skip, take },
      };
  
      // Structure the response
      return {
        statusCode: 200,
        message: 'Skills Retrieved Successfully',
        data: send_data,
      };
    } catch (error) {
      return {
        message: 'Failed to get skills',
        error: error.message,
        statusCode: 400,
      };
    }
  }
  
  

  //delete skill by id
  // async deleteSkillById(skillId: string): Promise<any> {
  //   try {
  //     // Validate the provided skill ID
  //     if (!Types.ObjectId.isValid(skillId)) {
  //       throw new BadRequestException('Invalid Skill ID.');
  //     }
  
  //     // Find the skill by ID and delete it
  //     const deletedSkill = await this.skillModel.findByIdAndDelete(skillId).exec();
  
  //     // Check if the skill exists
  //     if (!deletedSkill) {
  //       throw new NotFoundException(`Skill with ID "${skillId}" not found.`);
  //     }
  
  //     return { message: `Skill has been successfully deleted.` };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  async deleteSkillById(skillId: string): Promise<any> {
    try {
      // Step 1: Check if the skill exists
      const skill = await this.skillModel.findById(skillId);
      if (!skill) {
        throw new NotFoundException(`Skill not found.`);
      }
  
      // Step 2: Check if the skill is linked in any employee's my_skills
      const linkedEmployees = await this.employeeModel.find({
        "my_skills.skill_id": new Types.ObjectId(skillId),
      });
      console.log(linkedEmployees, "linkedEmployees");
  
      if (linkedEmployees.length > 0) {
        throw new ConflictException(
          `Cannot delete skill. This skill is associated with ${linkedEmployees.length} employee(s).`
        );
      }
  
      // Step 3: Proceed with deletion
      await this.skillModel.findByIdAndDelete(skillId);
  
      return {
        statusCode: 200,
        message: `Skill has been deleted successfully.`,
      };
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }
  


  
// skill update
  async updateSkill(id: string, updateSkillsDto: UpdateSkillsDto) {
    // Find the skill to update
    const skill = await this.skillModel.findById(id).exec();
    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    const { name, skill_code, category, version, skill_type } = updateSkillsDto;

    // Normalize the name and skill code
    const normalizedName = name ? name.trim().toLowerCase() : null;
    const normalizedCode = skill_code ? skill_code.trim().toLowerCase() : null;

    // Check if the name already exists (excluding the current skill)
    if (normalizedName) {
      const existingName = await this.skillModel
        .findOne({ name: normalizedName })
        .where('_id')
        .ne(id)
        .exec();
      if (existingName) {
        throw new ConflictException(`Skill with name "${normalizedName}" already exists`);
      }
    }

    // Check if the skill_code already exists (excluding the current skill)
    if (normalizedCode) {
      const existingSkillCode = await this.skillModel
        .findOne({ skill_code: normalizedCode })
        .where('_id')
        .ne(id)
        .exec();
      if (existingSkillCode) {
        throw new ConflictException(`Skill with skill code "${normalizedCode}" already exists`);
      }
    }

    // If category is provided, convert to ObjectId
    if (category && !Types.ObjectId.isValid(category)) {
      throw new ConflictException('Invalid Category');
    }

    //Ifskill_type provided
    if( skill_type && !Types.ObjectId.isValid(skill_type)){
      throw new ConflictException('Invalid Skill Type')
    }

    // Update version and is_active if provided
    // if (version) {
    //   skill.version = version;
    // }
    // if (typeof is_active === 'boolean') {
    //   skill.is_active = is_active;
    // }

    // Update the skill with the new values
    Object.assign(skill, updateSkillsDto);
    await skill.save();

    const updatedSkill = await this.skillModel
    .findById(skill._id)
    .populate('category')
    .populate('skill_type')
    .exec();
    // Return the updated skill with populated category details
    return {
       statusCode: 200,
       message: "Skill Updated Successfully",
       data:[updatedSkill]
    
    }
}


// create skill under category
async createSkill(createSkillDto: CreateSkillDto, categoryId: string): Promise<any> {
  const { name, skills_code, version } = createSkillDto;

  // Check if the name field is provided
  if (!name || !name.trim()) {
    throw new BadRequestException('The "Skill Name" field is required.');
  }

  // Check if the skills_code field is provided
  if (!skills_code || !skills_code.trim()) {
    throw new BadRequestException('The "Skill Code" field is required.');
  }

  // Normalize the name and skills_code
  const normalizedName = name.trim().toLowerCase();
  const normalizedCode = skills_code.trim().toLowerCase();

  // Check if a skill with the same name already exists in the database
  const existingSkillByName = await this.skillModel.findOne({ name: normalizedName });
  if (existingSkillByName) {
    throw new ConflictException(`Skill with name "${normalizedName}" already exists.`);
  }

  // Check if a skill with the same code already exists in the database
  const existingSkillByCode = await this.skillModel.findOne({ skills_code: normalizedCode });
  if (existingSkillByCode) {
    throw new ConflictException(`Skill with code "${normalizedCode}" already exists.`);
  }

  // Validate and convert categoryId to ObjectId
  const categoryObjectId = categoryId ? new Types.ObjectId(categoryId) : null;

  if (!categoryObjectId) {
    throw new BadRequestException('Invalid category ID.');
  }

  // Create a new skill document
  const skillData = {
    name: normalizedName, 
    skills_code: normalizedCode,
    category: categoryObjectId,
    version,
  };

  const newSkill = new this.skillModel(skillData);
  return await newSkill.save();
}

//get skill by category id 
async findByCategory(categoryId: string): Promise<any[]>{
  console.log(categoryId)
  const categoryObjectId = new Types.ObjectId(categoryId);
  console.log("categoryObjectId",categoryObjectId)
  return this.skillModel.find({category:categoryObjectId}).exec();
}



//create master data
// async create(createMasterDto: CreateMasterDto): Promise<any> {
//   const { value } = createMasterDto;
//   console.log(value)
//   const normalizedCode = value.trim().toUpperCase();
//   console.log(value)

//   const existingMaster = await this.masterModel.findOne({ value: normalizedCode }).exec();

//   if (existingMaster) {
//     throw new BadRequestException('Type with the same name already exists.');
//   }
//   const newMaster = new this.masterModel({
//     ...createMasterDto,
//     skill_type: normalizedCode, 
//   });
//   await newMaster.save();

//   return {
//     statusCode: 200,
//     message: 'Type Created Successfully',
//     data: newMaster,
//   };
// }
async create(createMasterDto: CreateMasterDto): Promise<any> {
  const { value } = createMasterDto;

  // Ensure the value is a string and normalize it to uppercase
  console.log("Original value:", value);
  const normalizedCode = value.trim().toUpperCase();
  console.log("Normalized code:", normalizedCode);

  // Check for duplicates by normalized value in a case-insensitive manner
  const existingMaster = await this.masterModel.findOne({
    value: { $regex: `^${normalizedCode}$`, $options: 'i' } // case-insensitive check
  }).exec();

  if (existingMaster) {
    throw new BadRequestException('Type with the same name already exists.');
  }

  // Create and save the new master entity
  const newMaster = new this.masterModel({
    ...createMasterDto,
    skill_type: normalizedCode, // Ensure you store the normalized value
  });
  await newMaster.save();

  return {
    statusCode: 200,
    message: 'Type Created Successfully',
    data: newMaster,
  };
}


//get all master data
// async findAll(): Promise<any> {
//   try {
//     const masterData = await this.masterModel.find().exec();
//     return {
//       statusCode: 200,
//       message: 'Master Data Fetched Successfully',
//       data: masterData,
//     };
//   } catch (error) {
//     throw new InternalServerErrorException('An error occurred while retrieving master data.');
//   }
// }
async findAll(Query: SearchInputDto): Promise<any> {
  try {
    // Map pagination parameters
    const pagination = PaginationMapper(Query);
    const { page, skip, take } = pagination;

    // Add pagination to the query (skip and limit)
    const masterData = await this.masterModel
      .find()
      .skip(skip)
      .limit(take)
      .exec();

    // Get the total count of master data
    const totalCount = await this.masterModel.countDocuments();

    // Check if master data is found
    if (!masterData || masterData.length === 0) {
      throw new NotFoundException('No master data found.');
    }

    // Prepare response data
    const send_data = {
      data: masterData,
      total: totalCount,
      pagination: { page, skip, take },
    };

    // Structure the response
    return {
      statusCode: 200,
      message: 'Master Data Fetched Successfully',
      data: send_data,
    };
  } catch (error) {
    return {
      message: 'Failed to fetch master data',
      error: error.message,
      statusCode: 400,
    };
  }
}



//get master by id
// async getMaster(id: string): Promise<any> {
//   try {
//     const masterObjectId = new Types.ObjectId(id);
//     const masterData = await this.masterModel.find({ master: masterObjectId }).exec();
//     return {
//       statusCode: 200,
//       message: 'Master Data Retrieved Successfully',
//       data: masterData
//     };
//   } catch (error) {
//     throw new InternalServerErrorException('An error occurred while retrieving master data.');
//   }
// }
async findOne(id: string): Promise<any> {
  try {
    const masterData = await this.masterModel.findById(id).exec();

    if (!masterData) {
      throw new NotFoundException(`Master Data with ID ${id} not found`);
    }

    return {
      statusCode: 200,
      message: 'Master Data Fetched Successfully',
      data: masterData,
    };
  } catch (error) {
    if (error.name === 'CastError') {
      throw new BadRequestException('Invalid ID format');
    }
    throw new InternalServerErrorException('An error occurred while retrieving master data.');
  }
}


//delete master data by id
// async deleteMasterById(masterId: string): Promise<any> {
//   try {
//     if (!Types.ObjectId.isValid(masterId)) {
//       throw new BadRequestException('Invalid MasterId ID.');
//     }
//     const deletedMaster = await this.masterModel.findByIdAndDelete(masterId).exec();

//     if (!deletedMaster) {
//       throw new NotFoundException(`Skill with ID "${masterId}" not found.`);
//     }

//     return { statusCode: 200, message: `Skill has been successfully deleted.` };
//   } catch (error) {
//     throw new InternalServerErrorException(error.message);
//   }
// }
async deleteMasterById(masterId: string): Promise<any> {
  try {
    // Step 1: Check if the master entry exists
    const master = await this.masterModel.findById(masterId);
    if (!master) {
      throw new NotFoundException(`Master entry not found.`);
    }

    // Step 2: Check if the master is associated with any skills
    const relatedSkills = await this.skillModel.find({ skill_type: masterId });
    console.log(relatedSkills, "relatedSkills");

    const skillIds = relatedSkills.map(skill => skill._id);
    console.log(skillIds, "skillIds");

    // Step 3: Check if any skill under this master is linked in my_skills
    const linkedMySkills = await this.employeeModel.find({
      "my_skills.skill_id": { $in: skillIds },
    });
    console.log(linkedMySkills, "linkedMySkills");

    if (linkedMySkills.length > 0) {
      throw new ConflictException(
        `Cannot delete master entry. Skills under this master are associated with ${linkedMySkills.length} employee(s).`
      );
    }

    // Step 4: Proceed with deletion
    await this.masterModel.findByIdAndDelete(masterId);

    return {
      statusCode: 200,
      message: `Master entry has been successfully deleted.`,
    };
  } catch (error) {
    throw new ConflictException(error.message);
  }
}


//update
async updateMaster(id: string, updateMasterDto: UpdateMasterDto): Promise<any> {
  try{
    const { value } = updateMasterDto;

    // Fetch the current master record to compare values
    const currentMaster = await this.masterModel.findById(id);
    if (!currentMaster) {
      throw new NotFoundException(`Master record with ID "${id}" not found.`);
    }
  
    // Check if the value is provided and differs from the current value
    if (value && value.trim() !== currentMaster.value) {
      const normalizedValue = value.trim();
  
      // Check if another record with the same value already exists
      const existingMaster = await this.masterModel.findOne({
        value: normalizedValue,
        _id: { $ne: id }, // Exclude the current record being updated
      });
  
      if (existingMaster) {
        throw new ConflictException(`Master record with value "${normalizedValue}" already exists.`);
      }
  
      currentMaster.value = normalizedValue; // Update the value if no conflict exists
    }
  
    // Save the updated master record
    const updatedMaster = await currentMaster.save();
  
    // Return success response
    return {
      statusCode: 200,
      message: 'Master Updated Successfully',
      data: updatedMaster,
    };
  }catch (err) {
    console.error('Error updating master record:', err);

    // Re-throw the error to propagate it to the controller
    if (err instanceof ConflictException || err instanceof NotFoundException) {
      throw err;
    }

    // Handle unexpected errors
    throw new InternalServerErrorException('An unexpected error occurred while updating the master record.');
  }
}



//get master data where type = skill type 
async getMasterDataByType( query: SearchInputDto): Promise<any> {
  try {
    // Map pagination parameters
    const pagination = PaginationMapper(query);
    const { page, skip, take } = pagination;

    // Find master data by type with pagination
    const masterData = await this.masterModel
      .find({ type: 'Skill Type' })
      .skip(skip)
      .limit(take)
      .exec();

    // Get the total count of master data for the given type
    const totalCount = await this.masterModel.countDocuments({ type: 'Skill Type' });

    // Check if master data is found
    if (!masterData || masterData.length === 0) {
      throw new NotFoundException('No master data found for the specified type.');
    }

    // Prepare response data
    const send_data = {
      data: masterData,
      total: totalCount,
      pagination: { page, skip, take },
    };

    // Structure the response
    return {
      statusCode: 200,
      message: 'Master Data Fetched Successfully',
      data: send_data,
    };
  } catch (error) {
    return {
      message: 'Failed to fetch master data',
      error: error.message,
      statusCode: 400,
    };
  }
}


//project type
async getMasterDataByProject( query: SearchInputDto): Promise<any> {
  try {
    // Map pagination parameters
    const pagination = PaginationMapper(query);
    const { page, skip, take } = pagination;

    // Find master data by type with pagination
    const masterData = await this.masterModel
      .find({ type: 'Project Type' })
      .skip(skip)
      .limit(take)
      .exec();

    // Get the total count of master data for the given type
    const totalCount = await this.masterModel.countDocuments({ type: 'Project Type' });

    // Check if master data is found
    if (!masterData || masterData.length === 0) {
      throw new NotFoundException('No master data found for the specified type.');
    }

    // Prepare response data
    const send_data = {
      data: masterData,
      total: totalCount,
      pagination: { page, skip, take },
    };

    // Structure the response
    return {
      statusCode: 200,
      message: 'Master Data Fetched Successfully',
      data: send_data,
    };
  } catch (error) {
    return {
      message: 'Failed to fetch master data',
      error: error.message,
      statusCode: 400,
    };
  }
}
}





  
  
  
  

      
