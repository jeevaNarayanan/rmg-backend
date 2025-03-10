import {
    IsArray,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    IsDate,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { Types } from 'mongoose';
  
  export class UpdateMembersDto {
    @IsOptional()
    @IsMongoId()
    employer_id?: Types.ObjectId;
  
    @IsOptional()
    @IsMongoId()
    role?: Types.ObjectId;
  
    @IsOptional()
    @IsNumber()
    allocated_hours?: number;


    @IsString()
    status?: string;

    @IsOptional()
    start_date?: Date;

    @IsOptional()
    end_date?: Date;

    @IsOptional()
    @IsMongoId()
    employement_type?:Types.ObjectId;

    @IsOptional()
    @IsNumber()
    allocated_hours_per_day:number
  }
  
  export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    project_name?: string;
  
    @IsOptional()
    @IsString()
    project_code?: string;
  
    @IsOptional()
    @IsMongoId()
    account?: Types.ObjectId;
  
    @IsOptional()
    @IsMongoId()
    project_type?: Types.ObjectId;
  
    @IsOptional()
    @IsMongoId()
    project_manager?: Types.ObjectId;
  
    @IsOptional()
    @IsDate()
    start_date?: Date;
  
    @IsOptional()
    @IsDate()
    end_date?: Date;
  
    @IsOptional()
    @IsString()
    status?: string;
  
    @IsOptional()
    @IsNumber()
    total_allocated_hours?: number;
  
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    tech_stack?: Types.ObjectId[];
  
    // @IsOptional()
    // @IsArray()
    // @Type(() => UpdateMembersDto)
    // @ValidateNested({ each: true })
    // members?: UpdateMembersDto[];
  }
  