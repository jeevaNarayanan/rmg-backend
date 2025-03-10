
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Audit } from '../schemas/audit.schema';



@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name) private auditModel: Model<Audit>,
    // @InjectModel(Employer.name) private employerModel: Model<Employer>,
    // @InjectModel(Recruiter.name) private recruiterModel: Model<Recruiter>,
    // @InjectModel(Job.name) private jobModel: Model<Job>,
    // @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit(): any {
    this.eventEmitter.on('event.data.audit', this.create.bind(this));
  }

  async create(data: Audit) {
    try {
      const audit = new this.auditModel(data);
      return await audit.save();
    } catch (e) {
      console.log('can not create audit trail', e);
    }
  }


  // async getAllAudits() {
  //   try {
  //     return await this.auditModel
  //       .find({ related_to: 'Project' }) // Filter for related_to: 'Project'
  //       .populate({
  //         path: 'created_by', // Field to populate
  //         select: 'name',    // Only fetch the 'name' field from the admin table
  //       })
  //       .exec(); // Execute the query
  //   } catch (e) {
  //     console.log('Unable to fetch audit trails', e);
  //   }
  // }

  async getAllAudits() {
    try {
      const audits = await this.auditModel
        .find({ related_to: 'Project' }) // Filter for related_to: 'Project'
        .populate({
          path: 'created_by', // Field to populate
          select: 'name',     // Only fetch the 'name' field from the admin table
        })
        .exec(); // Execute the query
  
      return {
        statusCode: 200, // Example: HTTP OK status code
        message: 'Audit trails fetched successfully',
        data: audits,
      };
    } catch (e) {
      console.log('Unable to fetch audit trails', e);
      return {
        statusCode: 400, // Example: HTTP Internal Server Error status code
        message: 'Unable to fetch audit trails',
        data: null,
      };
    }
  }
  
  
}