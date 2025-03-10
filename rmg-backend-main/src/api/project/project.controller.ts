import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CreateProjectDto, MembersDto } from './dto/create-project.dto';
import { AuthGuard } from '../auth/auth.gaurd';
import { RolesGuard } from '../auth/roles.gaurd';
import { ProjectService } from './project.service';
import { Public, Roles } from '../auth/roles.decorator';
import { RequestWithUser } from 'src/utils/interface.utils';
import { UpdateMembersDto, UpdateProjectDto } from './dto/update-project.dto';
import { SearchInputDto } from 'src/utils/search/search.input.dto';

@Controller('project')
@UseGuards(AuthGuard,RolesGuard)
export class ProjectController {

    constructor(private readonly projectService: ProjectService) {}


//get all projects
@Roles('admin')
@Get('all')
async getAllProjects(@Query() query: SearchInputDto) {
  try {
    return await this.projectService.getAllProjects(query);
  } catch (error) {
    throw error; 
  }
}


@Roles('admin')
@Post(':accountId')
async createProject(
  @Param('accountId') accountId: string,
  @Body() createProjectDto: CreateProjectDto,
  @Req() request: Request,
) {
  const req = request as RequestWithUser; // Assuming `RequestWithUser` includes user details
  const createdBy = req.user.sub; // Extract user ID from token
  return this.projectService.createProject(createProjectDto, createdBy, accountId);
}


//add members in project
@Roles('admin')
@Post('members/:projectId')
async addMemberToProject(
  @Param('projectId') projectId: string,
  @Body() membersDto: MembersDto,
) {
  return await this.projectService.addMember(projectId, membersDto);
}


//update
@Roles('admin')
@Put(':projectId')
async updateProject(
  @Param('projectId') projectId: string,
  @Body() updateProjectDto: UpdateProjectDto,
  @Req() request: Request,
) {
  const req = request as RequestWithUser; // Assuming `RequestWithUser` includes user details
  const updatedBy = req.user.sub;

  // No try-catch block needed here
  return this.projectService.updateProject(projectId, updateProjectDto, updatedBy);
}

//get all project under perticular account
@Roles('admin')
@Get('account/:accountId')
async getProjectsByAccount(@Param('accountId') accountId: string, @Query() query: SearchInputDto) {
  try {
    return await this.projectService.getProjectsByAccount(accountId, query);
  } catch (error) {
    throw error; 
  }
}

//active project by account
@Roles('admin')
@Get('account/:accountId/active')
async getActiveProjectsByAccount(@Param('accountId') accountId: string, @Query() query: SearchInputDto) {
  try {
    return await this.projectService.getActiveProjectsByAccount(accountId, query);
  } catch (error) {
    throw error; 
  }
}

//completed Project by account
@Roles('admin')
@Get('account/:accountId/completed')
async getCompletedProjectsByAccount(@Param('accountId') accountId: string, @Query() query: SearchInputDto) {
  try {
    return await this.projectService.getCompletedProjectsByAccount(accountId, query);
  } catch (error) {
    throw error; 
  }
}

//onhold project by account
@Roles('admin')
@Get('account/:accountId/onhold')
async getHoldProjectsByAccount(@Param('accountId') accountId: string, @Query() query: SearchInputDto) {
  try {
    return await this.projectService.getHoldProjectsByAccount(accountId, query);
  } catch (error) {
    throw error; 
  }
}


//get project by id
@Roles('admin','employer')
@Get(':projectId')
async getProjectById(@Param('projectId') projectId: string) {
  try {
    return await this.projectService.getProjectById(projectId);
  } catch (error) {
    throw error; 
  }
}



//get project by employer Id
@Roles('employer','admin')
@Get()
async getProjectsByEmployer(@Req() request: Request) {
  try {
    const req = request as RequestWithUser;
    const employerId = req.user.sub; // Extract employer ID from token

    return await this.projectService.getProjectsByEmployer(employerId);
  } catch (error) {
    throw error;
  }


}

//get all members in a project
@Public()
@Get(':projectId/members')
async getAllMembers(
  @Param('projectId') projectId: string,
  @Query() query: SearchInputDto
): Promise<any> {
  return await this.projectService.getProjectMembers(projectId, query);
}


@Roles('admin')
@Patch('members/:memberId')
async updateMember(
  @Param('memberId') memberId: string,
  @Body() updateMemberDto: UpdateMembersDto,
) {
  try {
    const result = await this.projectService.updateMember(memberId, updateMemberDto);
    return {
      statusCode: 200,
      message: result.message,
      data: result.member,
      projectId: result.projectId,
    };
  } catch (error) {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }
    // Catch other errors (e.g., database issues) and return a generic message
    throw new BadRequestException('An error occurred while updating the member.');
  }
}


}