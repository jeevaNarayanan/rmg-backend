import { InjectModel } from '@nestjs/mongoose';
import { CreateProjectDto, MembersDto } from './dto/create-project.dto';
import { Project } from '../schemas/project.schema';
import mongoose from 'mongoose';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import  { Types } from 'mongoose';
import { UpdateMembersDto, UpdateProjectDto } from './dto/update-project.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Account } from '../schemas/account.schema';
import { SearchInputDto } from 'src/utils/search/search.input.dto';
import { PaginationMapper } from 'src/utils/search/pagination.mapper';

@Injectable()
export class ProjectService {

    constructor(
        @InjectModel(Project.name)
        private projectModel: mongoose.Model<Project>,
        @InjectModel(Account.name)
        private accountModel: mongoose.Model<Account>,
        private eventEmitter: EventEmitter2,
    ){}


//create account  
async createProject(createProjectDto: CreateProjectDto, createdBy: string, accountId: string): Promise<any> {
        try {
          const account = new Types.ObjectId(accountId) 

          const accountStatus = await this.accountModel.findById(account).select('status');
          if (!accountStatus || accountStatus.status !== 'Active') {
            throw new BadRequestException('Cannot create a project for an inactive account.');
          }
          
          // Convert project_code to uppercase for uniformity
          const normalizedProjectCode = createProjectDto.project_code.toUpperCase();
      
          // Validate project code uniqueness
          const existingProject = await this.projectModel.findOne({
            project_code: normalizedProjectCode,
          });
      
          if (existingProject) {
            throw new ConflictException('Project code must be unique.');
          }
      
    
          const allocated_hours = createProjectDto.total_allocated_hours;
          const total_hours_currently_used = 0;
      
          // Convert fields to ObjectId
          const adminId = new Types.ObjectId(createdBy);
          const normalizedTechStack = createProjectDto.tech_stack.map((tech) => new Types.ObjectId(tech));
      
          const newProject = new this.projectModel({
            ...createProjectDto,
            project_code: normalizedProjectCode, // Save project_code in uppercase
            account: account,
            project_type: new Types.ObjectId(createProjectDto.project_type),
            project_manager: new Types.ObjectId(createProjectDto.project_manager),
            total_allocated_hours: allocated_hours,
            total_hours_currently_used: total_hours_currently_used,
            tech_stack: normalizedTechStack,
            // members: normalizedMembers,
            created_by: adminId,
            updated_by: adminId, 
          });
      
          const savedProject = await newProject.save();
      
          // Populate the required fields
          const populatedProject = await this.projectModel
            .findById(savedProject._id)
            .populate([
              { path: 'account', select:'name account_code'},
              { path: 'project_manager', select: 'first_name last_name email' },
              // { path: 'members.employer_id', select: 'first_name last_name email' },
              // { path: 'members.role', select: 'value' },
              { path: 'project_type', select: 'value' },
              {
                path: 'tech_stack',
                select: 'name category skill_type',
                populate: [
                  { path: 'category', select: 'name' },
                  { path: 'skill_type', select: 'value' },
                ],
              },
            ]);
      
          return {
            message: 'Project created successfully.',
            data: populatedProject,
            statusCode: 201,
          };
        } catch (error) {
          // Let exceptions propagate to the controller
          throw error;
        }
      }
      

// update project
    async updateProject(
        projectId: string,
        updateProjectDto: UpdateProjectDto,
        updatedBy: string
      ): Promise<any> {
        try {
          // Validate the project ID
          if (!Types.ObjectId.isValid(projectId)) {
            throw new BadRequestException('Invalid project ID.');
          }
      
          // Convert project_code to uppercase for checking duplicates
          if (updateProjectDto.project_code) {
            updateProjectDto.project_code = updateProjectDto.project_code.toUpperCase();
            const existingProject = await this.projectModel.findOne({
              project_code: updateProjectDto.project_code,
              _id: { $ne: projectId }, // Exclude the current project from the duplicate check
            });
      
            if (existingProject) {
              throw new ConflictException('Project code must be unique.');
            }
          }
      
          // Add updated_by to the update payload
          const adminId = new Types.ObjectId(updatedBy);
          const updatedPayload = {
            ...updateProjectDto,
            updated_by: adminId,
          };
      
          // Update the project
          const updatedProject = await this.projectModel
            .findByIdAndUpdate(projectId, updatedPayload, { new: true })
            .populate([
              { path: 'account', select:'name account_code'},
              { path: 'project_manager', select: 'first_name last_name email' },
              { path: 'members.employer_id', select: 'first_name last_name email' },
              { path: 'members.role', select: 'value' },
              { path: 'project_type', select: 'value' },
              {
                path: 'tech_stack',
                select: 'name category skill_type',
                populate: [
                  { path: 'category', select: 'name' },
                  { path: 'skill_type', select: 'value' },
                ],
              },
            ]);
      
          if (!updatedProject) {
            throw new NotFoundException('Project not found.');
          }

          const action = `Project ${updatedProject.project_name} has been updated by ${updatedBy}`;
          this.eventEmitter.emit('event.data.audit', {
            action: action,
            user_id: updatedBy,
            related_to: 'Project',
            related_id: projectId,
            updated_fields: updateProjectDto,
            created_by: adminId,
          });
          console.log("updated_fields")
      
          return {
            message: 'Project updated successfully.',
            data: updatedProject,
            statusCode: 200,
          };
        } catch (error) {
          // Let exceptions propagate to the controller
          throw error;
        }
      }


//all project under perticular account
  async getProjectsByAccount(accountId: string, query: SearchInputDto): Promise<any> {
    try {
        // Validate the account ID
        if (!Types.ObjectId.isValid(accountId)) {
            throw new BadRequestException('Invalid account ID.');
        }

        // Map pagination parameters
        const pagination = PaginationMapper(query);
        const { page, skip, take } = pagination;

        // Find projects for the specified account with pagination
        const projects = await this.projectModel
            .find({ account: new Types.ObjectId(accountId) })
            .skip(skip)
            .limit(take)
            .populate([
                { path: 'account', select: 'name' },
                { path: 'project_manager', select: 'first_name last_name email' },
                { path: 'members.employer_id', select: 'first_name last_name email' },
                { path: 'members.role', select: 'name' },
                { path: 'project_type', select: 'value' },
                {
                    path: 'tech_stack',
                    select: 'name category skill_type',
                    populate: [
                        { path: 'category', select: 'name' },
                        { path: 'skill_type', select: 'value' },
                    ],
                },
            ]);

        // Calculate percentage and add it to each project
        const projectsWithPercent = projects.map((project) => {
            const { total_hours_currently_used, total_allocated_hours } = project;
            let percent = null;

            // Check if total_allocated_hours is valid and not zero to prevent division by zero
            if (total_allocated_hours && total_allocated_hours > 0) {
                percent = (total_hours_currently_used * 100) / total_allocated_hours;
            }

            return {
                ...project.toObject(), // Convert the project document to plain JavaScript object
                percent, // Add the calculated percent field
            };
        });   

        // Get the total count of projects for the account
        const totalCount = await this.projectModel.countDocuments({ account: new Types.ObjectId(accountId) });

        // Prepare response data
        const send_data = {
            data: projectsWithPercent,
            total: totalCount,
            pagination: { page, skip, take },
        };

        return {
            message: 'Projects retrieved successfully.',
            data: send_data,
            statusCode: 200,
        };
    } catch (error) {
        // Let the exception propagate for the controller to handle
        throw error;
    }
}


//active project under account 
  async getActiveProjectsByAccount(accountId: string, query: SearchInputDto): Promise<any> {
    try {
        // Validate the account ID
        if (!Types.ObjectId.isValid(accountId)) {
            throw new BadRequestException('Invalid account ID.');
        }

        // Map pagination parameters
        const pagination = PaginationMapper(query);
        const { page, skip, take } = pagination;

        // Find projects for the specified account with pagination
        const projects = await this.projectModel
          .find({
            account: new Types.ObjectId(accountId),
            status: 'Active'  // Filter projects with active status
          })
            .skip(skip)
            .limit(take)
            .populate([
                { path: 'account', select: 'name' },
                { path: 'project_manager', select: 'first_name last_name email' },
                { path: 'members.employer_id', select: 'first_name last_name email' },
                { path: 'members.role', select: 'name' },
                { path: 'project_type', select: 'value' },
                {
                    path: 'tech_stack',
                    select: 'name category skill_type',
                    populate: [
                        { path: 'category', select: 'name' },
                        { path: 'skill_type', select: 'value' },
                    ],
                },
            ]);

        // Get the total count of projects for the account
        const totalCount = await this.projectModel.countDocuments({ account: new Types.ObjectId(accountId) });

        // Check if no projects are found
        // if (!projects || projects.length === 0) {
        //     throw new NotFoundException('No projects found for the given account.');
        // }

        // Prepare response data
        const send_data = {
            data: projects,
            total: totalCount,
            pagination: { page, skip, take },
        };

        return {
            message: 'Projects retrieved successfully.',
            data: send_data,
            statusCode: 200,
        };
    } catch (error) {
        // Let the exception propagate for the controller to handle
        throw error;
    }
}

//Completed Project by account
async getCompletedProjectsByAccount(accountId: string, query: SearchInputDto): Promise<any> {
  try {
      // Validate the account ID
      if (!Types.ObjectId.isValid(accountId)) {
          throw new BadRequestException('Invalid account ID.');
      }

      // Map pagination parameters
      const pagination = PaginationMapper(query);
      const { page, skip, take } = pagination;

      // Find projects for the specified account with pagination
      const projects = await this.projectModel
        .find({
          account: new Types.ObjectId(accountId),
          status: 'Completed'  // Filter projects with active status
        })
          .skip(skip)
          .limit(take)
          .populate([
              { path: 'account', select: 'name' },
              { path: 'project_manager', select: 'first_name last_name email' },
              { path: 'members.employer_id', select: 'first_name last_name email' },
              { path: 'members.role', select: 'name' },
              { path: 'project_type', select: 'value' },
              {
                  path: 'tech_stack',
                  select: 'name category skill_type',
                  populate: [
                      { path: 'category', select: 'name' },
                      { path: 'skill_type', select: 'value' },
                  ],
              },
          ]);

      // Get the total count of projects for the account
      const totalCount = await this.projectModel.countDocuments({ account: new Types.ObjectId(accountId) });

      // Check if no projects are found
      // if (!projects || projects.length === 0) {
      //     throw new NotFoundException('No projects found for the given account.');
      // }

      // Prepare response data
      const send_data = {
          data: projects,
          total: totalCount,
          pagination: { page, skip, take },
      };

      return {
          message: 'Projects retrieved successfully.',
          data: send_data,
          statusCode: 200,
      };
  } catch (error) {
      // Let the exception propagate for the controller to handle
      throw error;
  }
}


//on hold project under account
async getHoldProjectsByAccount(accountId: string, query: SearchInputDto): Promise<any> {
  try {
      // Validate the account ID
      if (!Types.ObjectId.isValid(accountId)) {
          throw new BadRequestException('Invalid account ID.');
      }

      // Map pagination parameters
      const pagination = PaginationMapper(query);
      const { page, skip, take } = pagination;

      // Find projects for the specified account with pagination
      const projects = await this.projectModel
        .find({
          account: new Types.ObjectId(accountId),
          status: 'On-Hold'  // Filter projects with active status
        })
          .skip(skip)
          .limit(take)
          .populate([
              { path: 'account', select: 'name' },
              { path: 'project_manager', select: 'first_name last_name email' },
              { path: 'members.employer_id', select: 'first_name last_name email' },
              { path: 'members.role', select: 'name' },
              { path: 'project_type', select: 'value' },
              {
                  path: 'tech_stack',
                  select: 'name category skill_type',
                  populate: [
                      { path: 'category', select: 'name' },
                      { path: 'skill_type', select: 'value' },
                  ],
              },
          ]);

      // Get the total count of projects for the account
      const totalCount = await this.projectModel.countDocuments({ account: new Types.ObjectId(accountId) });

      // Check if no projects are found
      // if (!projects || projects.length === 0) {
      //     throw new NotFoundException('No projects found for the given account.');
      // }

      // Prepare response data
      const send_data = {
          data: projects,
          total: totalCount,
          pagination: { page, skip, take },
      };

      return {
          message: 'Projects retrieved successfully.',
          data: send_data,
          statusCode: 200,
      };
  } catch (error) {
      // Let the exception propagate for the controller to handle
      throw error;
  }
}
  

 //get projectBy id
  async getProjectById(projectId: string): Promise<any> {
        try {
          // Validate the project ID
          if (!Types.ObjectId.isValid(projectId)) {
            throw new BadRequestException('Invalid project ID.');
          }
      
          // Find the project by ID and populate all required fields
          const project = await this.projectModel
            .findById(new Types.ObjectId(projectId))
            .populate([
              { path: 'account', select : 'name'},
              { path: 'project_manager', select: 'first_name last_name email' },
              { path: 'members.employer_id', select: 'first_name last_name email' },
              { path: 'members.role', select: 'name' },
              { path: 'project_type', select: 'value' },
              {
                path: 'tech_stack',
                select: 'name category skill_type',
                populate: [
                  { path: 'category', select: 'name' },
                  { path: 'skill_type', select: 'value' },
                ],
              },
            ]);
      
          // If project is not found
          if (!project) {
            throw new NotFoundException('Project not found.');
          }
      
          return {
            message: 'Project retrieved successfully.',
            data: project,
            statusCode: 200,
          };
        } catch (error) {
          // Let the exception propagate for the controller to handle
          throw error;
        }
      }
      

//get all projects
async getAllProjects(query: SearchInputDto): Promise<any> {
  try {
    // Map pagination parameters
    const pagination = PaginationMapper(query);
    const { page, skip, take } = pagination;

    // Fetch and populate the projects with pagination
    const populatedProjects = await this.projectModel
      .find()
      .skip(skip)
      .limit(take)
      .populate([
        { path: 'account', select: 'name' },
        { path: 'project_manager', select: 'first_name last_name email' },
        { path: 'members.employer_id', select: 'first_name last_name email' },
        { path: 'members.role', select: 'name' },
        { path: 'project_type', select: 'value' },
        {
          path: 'tech_stack',
          select: 'name category skill_type',
          populate: [
            { path: 'category', select: 'name' },
            { path: 'skill_type', select: 'value' },
          ],
        },
      ]);

    // Calculate percentage and append it to each project
    const projectsWithPercent = populatedProjects.map((project) => {
      const { total_hours_currently_used, total_allocated_hours } = project;
      const percent = total_allocated_hours && total_allocated_hours > 0
        ? (total_hours_currently_used * 100) / total_allocated_hours
        : null;

      return {
        ...project.toObject(), // Convert the project document to a plain JavaScript object
        percent, // Add the calculated percentage field
      };
    });

    // Get the total count of projects
    const totalCount = await this.projectModel.countDocuments();

    // Prepare response data
    const send_data = {
      data: projectsWithPercent,
      total: totalCount,
      pagination: { page, skip, take },
    };

    return {
      message: 'Projects retrieved successfully.',
      data: send_data,
      statusCode: 200,
    };
  } catch (error) {
    console.error('Error retrieving projects:', error);
    throw new InternalServerErrorException('Failed to retrieve projects.');
  }
}

//get all project where matches employerId
  async getProjectsByEmployer(employerId: string): Promise<any> {
    try {
      console.log(employerId,"employerId")
      const id = new Types.ObjectId(employerId)
      // Fetch all projects where employer_id inside members matches the given employerId
      const projects = await this.projectModel
        .find({ 'members.employer_id': id })
        .select('-members')
        .populate([
          { path: 'account', select : 'name'},
          { path: 'project_manager', select: 'first_name last_name email' },
          // { path: 'members.employer_id', select: 'first_name last_name email' },
          // { path: 'members.role', select: 'value' },
          { path: 'project_type', select: 'value' },
          {
            path: 'tech_stack',
            select: 'name category skill_type',
            populate: [
              { path: 'category', select: 'name' },
              { path: 'skill_type', select: 'value' },
            ],
          },
        ]);
  
      return {
        message: 'Projects retrieved successfully.',
        data: projects,
        statusCode: 200,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve projects.');
    }
  }
  
//get all members in a project
  async getProjectMembers(projectId: string, query: SearchInputDto): Promise<any> {
    try {
      // Validate the project ID
      if (!Types.ObjectId.isValid(projectId)) {
        throw new BadRequestException('Invalid project ID.');
      }

      // Map pagination parameters
      const pagination = PaginationMapper(query);
      const { page, skip, take } = pagination;

      // Find the project by ID and populate members with their details, with pagination
      const project = await this.projectModel
        .findById(new Types.ObjectId(projectId))
        .select('members')
        .populate({
          path: 'members.employer_id',
          select: 'first_name last_name',
        })
        .populate({
          path: 'members.role',
          select: 'name',
        });

      // If project not found
      if (!project) {
        throw new NotFoundException('Project not found.');
      }

      // Apply pagination to members
      const paginatedMembers = project.members.slice(skip, skip + take);

      // Prepare response data
      const send_data = {
        data: paginatedMembers,
        total: project.members.length,
        pagination: { page, skip, take },
      };

      return {
        message: 'Members retrieved successfully.',
        data: send_data,
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
  
//add members in a project
async addMember(projectId: string, membersDto: MembersDto) {
  const projectObjectId = new Types.ObjectId(projectId)
  const project = await this.projectModel.findById(projectObjectId);

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  if (project.status !== 'Active') {
    throw new BadRequestException('You can only add members to an active project.');
  }
  

  const startdate = membersDto.start_date;
  const enddate = membersDto.end_date;
  console.log(startdate,"startdate")
  console.log(enddate,"enddate")
  const start = project.start_date;
  const end = project.end_date;
  console.log(start,"start")
  console.log(end,"end")
  
  // Validate date constraints
  if (
    new Date(membersDto.start_date).getTime() < new Date(project.start_date).getTime() ||
    new Date(membersDto.end_date).getTime() > new Date(project.end_date).getTime()
  ) {
    throw new BadRequestException(
      'Member start date and end date must fall within project duration',
    );
  }
  
  const isEmployerExist = project.members.some(
    (member) => member.employer_id.toString() === membersDto.employer_id.toString(),
  );

  if (isEmployerExist) {
    throw new BadRequestException('This employer is already a member of the project.');
  }

  

  // Check allocated hours per day across all projects
  const employerId = new Types.ObjectId(membersDto.employer_id);

  // Fetch all projects where the employer is a member
  const allProjects = await this.projectModel.find({
    "members.employer_id": employerId,
    status: "Active", // Only consider active projects
  });

  let totalAllocatedHoursPerDay = 0;

  // Loop through the projects and filter members based on active status
  allProjects.forEach((proj) => {
    proj.members.forEach((member) => {
      if (
        member.employer_id.toString() === membersDto.employer_id.toString() && // Check employer ID
        member.status === "Active" // Check if the member is active
      ) {
        totalAllocatedHoursPerDay += member.allocated_hours_per_day;
      }
    });
  });

  // Validate the total allocated hours per day
  if (totalAllocatedHoursPerDay + membersDto.allocated_hours_per_day > 8) {
    throw new BadRequestException(
      `Cannot allocate ${membersDto.allocated_hours_per_day} hours per day to this employee. The total allocation across all projects exceeds 8 hours per day.`,
    );
  }


  // Check total allocated hours of the project
  const currentAllocatedHours = project.members.reduce(
    (sum, member) => sum + member.allocated_hours,
    0,
  );

  if (currentAllocatedHours + membersDto.allocated_hours > project.total_allocated_hours) {
    throw new BadRequestException(
      `Cannot allocate ${membersDto.allocated_hours} hours to this member. The total allocated hours for the project exceeds the allowed limit of ${project.total_allocated_hours} hours.`,
    );
  }

  // Add member to the project
  const newMember = {
    employer_id: new Types.ObjectId(membersDto.employer_id),
    role: new Types.ObjectId(membersDto.role),
    allocated_hours: membersDto.allocated_hours,
    allocated_hours_per_day: membersDto.allocated_hours_per_day,
    burned_hours: 0, 
    start_date: membersDto.start_date,
    end_date: membersDto.end_date,
    status: membersDto.status,
    employement_type: new Types.ObjectId(membersDto.employement_type)
  };

  project.members.push(newMember as any);

  await project.save();

  return {
    message: 'Member added successfully',
    member: newMember,
  };
}

//update members

async updateMember(memberId: string, updateMemberDto: UpdateMembersDto) {
  const memberObjectId = new Types.ObjectId(memberId);

  // Find the project containing the member
  const project = await this.projectModel.findOne({
    "members._id": memberObjectId,
  });

  console.log("project",project)
  if (!project) {
    throw new NotFoundException('Member not found in any project.');
  }

  if (project.status !== 'Active') {
    throw new BadRequestException('You can only update members in an active project.');
  }

  
  const memberToUpdate = await this.projectModel.findOne({
    "project.members": { $in: [memberObjectId] }
  });

  console.log(memberToUpdate,"memberToUpdate")
  

  if (!memberToUpdate) {
    throw new NotFoundException('Member not found in the project.');
  }

  if (
    updateMemberDto.start_date &&
    new Date(updateMemberDto.start_date).getTime() < new Date(project.start_date).getTime()
  ) {
    throw new BadRequestException('Member start date must fall within project duration.');
  }

  if (
    updateMemberDto.end_date &&
    new Date(updateMemberDto.end_date).getTime() > new Date(project.end_date).getTime()
  ) {
    throw new BadRequestException('Member end date must fall within project duration.');
  }

  // Check allocated hours per day across all active projects and members
  // if (updateMemberDto.status === 'Active') {
  //   const employerId = memberToUpdate.employer_id;

  //   const allProjects = await this.projectModel.find({
  //     "members.employer_id": employerId,
  //     status: 'Active', // Only consider active projects
  //   });

  //   let totalAllocatedHoursPerDay = 0;

  //   allProjects.forEach((proj) => {
  //     proj.members.forEach((member) => {
  //       if (
  //         member.employer_id.toString() === employerId.toString() &&
  //         member.status === 'Active'
  //       ) {
  //         totalAllocatedHoursPerDay += member.allocated_hours_per_day;
  //       }
  //     });
  //   });

  //   if (
  //     totalAllocatedHoursPerDay - memberToUpdate.allocated_hours_per_day +
  //     (updateMemberDto.allocated_hours_per_day || memberToUpdate.allocated_hours_per_day) > 8
  //   ) {
  //     throw new BadRequestException(
  //       'Cannot activate this member. Total allocated hours per day across all projects exceed 8 hours.'
  //     );
  //   }
  // }

  // // Check total allocated hours of the project
  // if (
  //   updateMemberDto.status === 'Active' ||
  //   updateMemberDto.allocated_hours !== undefined
  // ) {
  //   const currentAllocatedHours = project.members
  //     .filter((member) => member.status === 'Active')
  //     .reduce((sum, member) => sum + member.allocated_hours, 0);

  //   const newAllocatedHours =
  //     updateMemberDto.allocated_hours !== undefined
  //       ? updateMemberDto.allocated_hours
  //       : memberToUpdate.allocated_hours;

  //   if (
  //     currentAllocatedHours - memberToUpdate.allocated_hours + newAllocatedHours >
  //     project.total_allocated_hours
  //   ) {
  //     throw new BadRequestException(
  //       'Cannot update this member. Total allocated hours for the project exceeds the allowed limit.'
  //     );
  //   }
  // }

  // Update the member details
  Object.assign(memberToUpdate, updateMemberDto);

  await project.save();

  return {
    message: 'Member updated successfully',
    member: memberToUpdate,
    projectId: project._id, // Optionally return the project ID for reference
  };
}



  
      
}
