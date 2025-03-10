import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Put, UseGuards, Query } from '@nestjs/common';
import { LoginAdminDto } from './dto/login-admin.dto';
import { AdminService } from './admin.service';
import { Admin } from '../schemas/admin.schema';
import { Public, Roles, SkipToken } from '../auth/roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import {  Types } from 'mongoose';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillsDto } from './dto/update-skills.dto';
import { CreateFrameworkDto } from './dto/create-framwork.dto';
import { AuthGuard } from '../auth/auth.gaurd';
import { RolesGuard } from '../auth/roles.gaurd';
import { Skill } from '../schemas/skill.schema';
import { UpdateFrameworkDto } from './dto/update-framework.dto';
import { Category } from '../schemas/category.schema';
import { CreateMasterDto, UpdateMasterDto } from './dto/create-master.dto';
import { Master } from '../schemas/master.schema';
import { SearchInputDto } from 'src/utils/search/search.input.dto';



@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
constructor(private adminService: AdminService) {}


//project type master
@Roles('admin')
@Get('master/project')
async getMasterDataByProject(
  @Query() query: SearchInputDto
) {
  return await this.adminService.getMasterDataByProject(query);
}


  //get master data where type = skill type 
  @Roles('admin')
  @Get('master/skill')
  async getMasterDataBySkillType(
    @Query() query: SearchInputDto
  ) {
    return await this.adminService.getMasterDataByType(query);
  }

@Roles('admin')
@Get('master/:id')
async findOne(@Param('id') id: string) {
  return await this.adminService.findOne(id);
}


//login
@Public()
@SkipToken()
@Post('/login')
async login(@Body() loginAdminDto: LoginAdminDto): Promise<any> {
  return await this.adminService.login(loginAdminDto);
}

//create category
  // @Roles('admin') 
  //  @Post('/category')
  // async createCategory(
  //   @Body() createCategoryDto: CreateCategoryDto,
  // ): Promise<any> {    
  //   const category = await this.adminService.createCategory(createCategoryDto);
  //   return {
  //     message: 'Category created successfully',
  //     data: category,
  //   };
  // }
  @Roles('admin') 
  @Post('category')
async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<any> {
  return this.adminService.createCategory(createCategoryDto);
}


//update category
  @Roles('admin')
  @Public()
  @Put('category/:id')
  async updateCategory(
    @Param('id') id: string, 
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
     return this.adminService.updateCategory(id, updateCategoryDto);
  }

//get category by Id 
  @Roles('admin')
  @Get('category/:id')
  async getCategoryById(@Param('id') id: string) {
    return this.adminService.getCategoryById(id);
}


//get all category
@Roles('admin')
@Post('category/all')
async getAllCategories(
  @Query() param: SearchInputDto
) {
  return this.adminService.getAllCategories(param);
}


//delete category by id
@Roles('admin')
 @Delete('category/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }


//delete all category
@Roles('admin')
@Delete('category')
  async deleteAllCategories() {
    return this.adminService.deleteAllCategories();
  }

//creating skill
@Roles('admin')
@Post('skill')
  async createSkills(@Body() createSkillDto: CreateSkillDto) {
    return await this.adminService.createSkills(createSkillDto);
  }

//get skill by id
@Roles('admin')
@Get('skill/:id')
async getSkillById(@Param('id') skillId: string): Promise<any> {
  return await this.adminService.getSkillById(skillId);
}

//get all skills
@Roles('admin','employer')
@Post('skill/all')
async getAllSkills(
  @Query() param: SearchInputDto
): Promise<any> {
  return await this.adminService.getAllSkills(param);
}

// delete skill by id 
@Roles('admin')
@Delete('skill/:id')
async deleteSkillById(@Param('id') skillId: string): Promise<any> {
  return await this.adminService.deleteSkillById(skillId);
}


//update skill
@Roles('admin')
@Put('skill/:id')
  async updateSkill(
    @Param('id') id: string,
    @Body() updateSkillsDto: UpdateSkillsDto
  ) {
    return await this.adminService.updateSkill(id, updateSkillsDto);
  }

//skill created under category
@Roles('admin')
@Post('skill/:category')
async createSkill(
  @Param('category') categoryId: string, // Get category ID from params
  @Body() createSkillDto: CreateSkillDto,
) {
  return await this.adminService.createSkill(createSkillDto, categoryId);
}

//skill under category
@Roles('admin')
@Get(':categoryId/skill')
  async getSkillByFramework(@Param('categoryId') categoryId: string): Promise<Skill[]>{
    return this.adminService.findByCategory(categoryId)
  }



// add data in master
@Public()
@Roles('admin')
@Post('master')
async create(@Body() createMasterDto: CreateMasterDto) {
  return await this.adminService.create(createMasterDto);
}

//fetch master
@Roles('admin')
@Get('master')
async findAll(
  @Query() param: SearchInputDto
) {
  return await this.adminService.findAll(param);
}

//get master by id
// @Roles('admin')
// @Get('master/:id')
// async findOne(@Param('id') id: string) {
//   return await this.adminService.findOne(id);
// }


//deleteMasterData
@Roles('admin')
@Delete('master/:masterId')
async deleteMaster(@Param('masterId') masterId:string){
  return this.adminService.deleteMasterById(masterId);

}


//update master
@Roles('admin')
@Patch(':id')
  async updateMaster(
    @Param('id') id: string,
    @Body() updateMasterDto: UpdateMasterDto
  ) {
    console.log("ssssssss");
    
    return this.adminService.updateMaster(id, updateMasterDto);
  }




//   //get master data where type = skill type 
// @Roles('admin')
// @Get('master/skill')
// async getMasterDataBySkillType(
//   @Query() query: SearchInputDto
// ) {
//   return await this.adminService.getMasterDataByType(query);
// }

//project type master
// @Roles('admin')
// @Get('master/project')
// async getMasterDataByProject(
//   @Query() query: SearchInputDto
// ) {
//   return await this.adminService.getMasterDataByProject(query);
// }

}
