import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    IsEmail,
    IsNumber,
    IsMongoId,
  } from 'class-validator';
  import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class MembersDto {
    

    @IsNotEmpty()
    @IsMongoId()
    employer_id: Types.ObjectId;
  
    @IsNotEmpty()
    @IsMongoId()
    role: Types.ObjectId;
  
    @IsNotEmpty()
    @IsNumber()
    allocated_hours: number;

    @IsNotEmpty()
    @IsNumber()
    allocated_hours_per_day:number

    @IsNotEmpty()
    @IsString()
    status: string;

    @IsNotEmpty()
    start_date: Date;

    @IsNotEmpty()
    end_date: Date;

    @IsNotEmpty()
    @IsMongoId()
    employement_type:Types.ObjectId;


  }
  
  export class CreateProjectDto{
    @IsNotEmpty()
    @IsString()
    project_name: string;

    @IsNotEmpty()
    @IsString()
    project_code: string;
  
    // @IsNotEmpty()
    // @IsMongoId()
    // account: Types.ObjectId;
  
    @IsNotEmpty()
    @IsMongoId()
    project_type: Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    project_manager: Types.ObjectId;

    @IsNotEmpty()
    start_date: Date;

    @IsNotEmpty()
    end_date: Date;

    @IsString()
    status: string;

    @IsNumber()
    @IsNotEmpty()
    total_allocated_hours:number
  
    @IsArray()
    @IsNotEmpty()
    tech_stack:Types.ObjectId[];

    // @IsArray()
    // @Type(() => MembersDto)
    // members: MembersDto[];
  }
  
  
 