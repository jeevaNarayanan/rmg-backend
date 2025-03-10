import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Log } from '../schemas/log.schema';
import { Project } from '../schemas/project.schema';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';

@Injectable()
export class LogService {

  constructor(
    @InjectModel(Log.name)
    private logModel: mongoose.Model<Log>,
    @InjectModel(Project.name) 
    private projectModel:mongoose.Model<Project>,
  ){}


//create log
async createLog(projectId: string, employerId: string, logDto: CreateLogDto) {
  // Step 1: Find the project by ID
  const project = await this.projectModel.findById(projectId);
  if (!project) {
    throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
  }
  console.log(project,"project")

  // Step 2: Check if the project is active
  if (project.status !== 'Active') {
    throw new HttpException('Project is not active', HttpStatus.BAD_REQUEST);
  }

  // Step 3: Find the employer in the project members
  const member = project.members.find((m) => m.employer_id.toString() === employerId);
  if (!member) {
    throw new HttpException('Employer not part of the project', HttpStatus.FORBIDDEN);
  }
  console.log(member,"member")

  // if(member.status != 'Active'){
  //   throw new HttpException(
  //     `You are not 'Active Member' in this project`,
  //     HttpStatus.BAD_REQUEST,
  //   )
  // }
  

  // Step 4: Validate that the log time is within the daily allocated hours
  if (logDto.log_time > member.allocated_hours_per_day) {
    throw new HttpException(
      `Log time exceeds the allocated hours per day (${member.allocated_hours_per_day} hrs)`,
      HttpStatus.BAD_REQUEST,
    );
  }
  console.log(member.allocated_hours_per_day,"member.allocated_hours_per_day")

   // Step 5: Create a new Date object for the log date
   const logDate = new Date(logDto.date); // assuming logDto.date contains the date field
   console.log(logDate,"logDate")

   // Step 6: Create the start and end of the day based on logDate
   const startOfDay = new Date(logDate);
   startOfDay.setHours(0, 0, 0, 0); // Set to start of the day (00:00:00)
 
   const endOfDay = new Date(logDate);
   endOfDay.setHours(23, 59, 59, 999); // Set to end of the day (23:59:59)
 
   // Step 7: Find all logs for the employer on the same date (from start to end of the day)
   const todayLogs = await this.logModel.find({
     employer_id: new Types.ObjectId(employerId),
     date: logDate
   });
   console.log(todayLogs,"todayLogs")
 
   // Step 8: Calculate total logged time for the day, including the new log
   const totalLoggedTimeToday = todayLogs.reduce((sum, log) => sum + Number(log.log_time), 0);
   console.log(totalLoggedTimeToday,"totalLoggedTimeToday")
  
  
  //  const totalLoggedTimeWithNewLog = totalLoggedTimeToday + logDto.log_time;
  // Ensure both totalLoggedTimeToday and logDto.log_time are numbers before adding
  const totalLoggedTimeWithNewLog = Number(totalLoggedTimeToday) + Number(logDto.log_time);

  console.log(totalLoggedTimeWithNewLog,"totalLoggedTimeWithNewLog")
   // Step 9: Check if adding this log exceeds the allocated hours per day
   if (totalLoggedTimeWithNewLog > member.allocated_hours_per_day) {
     throw new HttpException(
       `Total log time for today exceeds allocated hours per day (${member.allocated_hours_per_day} hrs)`,
       HttpStatus.BAD_REQUEST,
     );
   }
 
   // Step 10: Check if adding this log exceeds the total allocated hours for the member
   const totalBurnedHours = Number(member.burned_hours || 0) + Number(logDto.log_time);
   console.log(member.burned_hours,"--member.burned_hours")
   if (totalBurnedHours > member.allocated_hours) {
     throw new HttpException(
       `Log time exceeds the total allocated hours (${member.allocated_hours} hrs) for the member`,
       HttpStatus.BAD_REQUEST,
     );
   }
   console.log(member.allocated_hours,"member.allocated_hours")
 

  // Step 10: Create a new log entry
  const newLog = new this.logModel({
    ...logDto,
    employer_id: new Types.ObjectId(employerId),
    project_id: new Types.ObjectId(projectId),
    date: logDate,
  });

  // Step 11: Save the new log entry
  await newLog.save();

  // Step 12: Update the burned_hours for the member
  member.burned_hours = totalBurnedHours;
  console.log(member.burned_hours,"member.burned_hours")

  // Step 13: Update the total_hours_currently_used in the project schema
  project.total_hours_currently_used = (Number(project.total_hours_currently_used) || 0) + Number(logDto.log_time);
  console.log(project.total_hours_currently_used,"project.total_hours_currently_used")

  // Step 14: Perform the update in one query to ensure the project and member data are updated
  await this.projectModel.updateOne(
    { _id: new Types.ObjectId(projectId), "members.employer_id": new Types.ObjectId(employerId) },
    {
      $set: {
        "members.$.burned_hours": member.burned_hours,  // Update member's burned_hours
        total_hours_currently_used: project.total_hours_currently_used,  // Update project's total_hours_currently_used
      },
    }
  );

  // Step 15: Return success response with new log data
  return {
    statusCode: HttpStatus.CREATED,
    message: 'Log created successfully',
    data: newLog,
  };
}


//update log
async updateLog(logId: string, logDto: UpdateLogDto) {
  // Step 1: Find the log by ID
  const existingLog = await this.logModel.findById(logId);
  if (!existingLog) {
    throw new HttpException('Log not found', HttpStatus.NOT_FOUND);
  }

  console.log(existingLog, "existingLog");

  // Step 2: Find the project by ID
  const project = await this.projectModel.findById(existingLog.project_id);
  if (!project) {
    throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
  }
  console.log(project, "project");

  // Step 3: Check if the project is active
  if (project.status !== 'Active') {
    throw new HttpException('Project is not active', HttpStatus.BAD_REQUEST);
  }

  // Step 4: Find the employer in the project members
  const member = project.members.find((m) => m.employer_id.toString() === existingLog.employer_id.toString());
  if (!member) {
    throw new HttpException('Employer not part of the project', HttpStatus.FORBIDDEN);
  }
  console.log(member, "member");

  // if (member.status !== 'Active') {
  //   throw new HttpException(
  //     `You are not an 'Active Member' in this project`,
  //     HttpStatus.BAD_REQUEST,
  //   );
  // }

  // Step 5: Validate that the log time is within the daily allocated hours
  if (logDto.log_time > member.allocated_hours_per_day) {
    throw new HttpException(
      `Log time exceeds the allocated hours per day (${member.allocated_hours_per_day} hrs)`,
      HttpStatus.BAD_REQUEST,
    );
  }

  console.log(member.allocated_hours_per_day, "member.allocated_hours_per_day");

  // Step 6: Create a new Date object for the log date
  const logDate = new Date(logDto.date);
  console.log(logDate, "logDate");

  // Step 7: Calculate total logged time for the day, excluding the existing log
  const startOfDay = new Date(logDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(logDate);
  endOfDay.setHours(23, 59, 59, 999);

  const todayLogs = await this.logModel.find({
    employer_id: new Types.ObjectId(existingLog.employer_id),
    date: logDate,
    _id: { $ne: logId }, // Exclude the current log being updated
  });

  console.log(todayLogs, "todayLogs");

  const totalLoggedTimeToday = todayLogs.reduce((sum, log) => sum + Number(log.log_time), 0);
  console.log(totalLoggedTimeToday, "totalLoggedTimeToday");

  const totalLoggedTimeWithUpdatedLog = totalLoggedTimeToday + Number(logDto.log_time);
  console.log(totalLoggedTimeWithUpdatedLog, "totalLoggedTimeWithUpdatedLog");

  if (totalLoggedTimeWithUpdatedLog > member.allocated_hours_per_day) {
    throw new HttpException(
      `Total log time for today exceeds allocated hours per day (${member.allocated_hours_per_day} hrs)`,
      HttpStatus.BAD_REQUEST,
    );
  }

  // Step 8: Check if updating this log exceeds the total allocated hours for the member
  const burnedHoursExcludingLog = Number(member.burned_hours) - Number(existingLog.log_time);
  const totalBurnedHours = burnedHoursExcludingLog + Number(logDto.log_time);

  if (totalBurnedHours > member.allocated_hours) {
    throw new HttpException(
      `Log time exceeds the total allocated hours (${member.allocated_hours} hrs) for the member`,
      HttpStatus.BAD_REQUEST,
    );
  }

  console.log(member.allocated_hours, "member.allocated_hours");

  // // Step 9: Update the log entry
  // existingLog.log_time = logDto.log_time;
  // existingLog.date = logDto.date;
  // existingLog.activity = logDto.activity;
  // await existingLog.save();

  // // Step 10: Update the burned_hours for the member
  // member.burned_hours = totalBurnedHours;

  // // Step 11: Update the total_hours_currently_used in the project schema
  // project.total_hours_currently_used =
  //   (Number(project.total_hours_currently_used) || 0) -
  //   Number(existingLog.log_time) +
  //   Number(logDto.log_time);

  // console.log(project.total_hours_currently_used, "project.total_hours_currently_used");

  // // Step 12: Perform the update in one query to ensure the project and member data are updated
  // await this.projectModel.updateOne(
  //   { _id: new Types.ObjectId(existingLog.project_id), "members.employer_id": new Types.ObjectId(existingLog.employer_id) },
  //   {
  //     $set: {
  //       "members.$.burned_hours": member.burned_hours,
  //       total_hours_currently_used: project.total_hours_currently_used,
  //     },
  //   }
  // );

  // Step 9: Calculate the difference in log hours
const existingLogTime = Number(existingLog.log_time);
const newLogTime = Number(logDto.log_time);
const logTimeDifference = newLogTime - existingLogTime; // Positive or negative

if (logTimeDifference !== 0) {
  // Update the burned_hours for the member
  member.burned_hours = Number(member.burned_hours) + logTimeDifference;

  // Update the total_hours_currently_used in the project schema
  project.total_hours_currently_used =
    (Number(project.total_hours_currently_used) || 0) + logTimeDifference;

  console.log(
    `Log time difference: ${logTimeDifference}, Updated burned_hours: ${member.burned_hours}, Updated total_hours_currently_used: ${project.total_hours_currently_used}`
  );

  // Step 12: Perform the update in one query to ensure the project and member data are updated
  await this.projectModel.updateOne(
    { 
      _id: new Types.ObjectId(existingLog.project_id), 
      "members.employer_id": new Types.ObjectId(existingLog.employer_id) 
    },
    {
      $set: {
        "members.$.burned_hours": member.burned_hours,
        total_hours_currently_used: project.total_hours_currently_used,
      },
    }
  );
}

// Step 9: Update the log entry
existingLog.log_time = logDto.log_time;
existingLog.date = logDto.date;
existingLog.activity = logDto.activity;
await existingLog.save();


  // Step 13: Return success response with updated log data
  return {
    statusCode: HttpStatus.OK,
    message: 'Log updated successfully',
    data: existingLog,
  };
}


//get log buy Id
async getLogById(logId: string): Promise<any> {

  const log = await this.logModel
  .findById(new Types.ObjectId(logId))
  if (!log) {
    throw new NotFoundException(`Log with ID ${logId} not found`);
  }
  return log; 
}

//get log by employerid and projectid
async getLogs(projectId: string, employerId: string) {
  const logs = await this.logModel.find({
    employer_id: new Types.ObjectId(employerId),
    project_id: new Types.ObjectId(projectId),
  }).exec();


  return {
    statusCode: HttpStatus.OK,
    message: 'Logs retrieved successfully',
    data: logs,
  };
}

}
