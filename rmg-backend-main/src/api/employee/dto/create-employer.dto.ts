import { IsEmail, IsNotEmpty, IsString, IsNumber, IsOptional, IsDate, IsEnum } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsDate()
  date_of_joined: Date;

  @IsString()
  @IsOptional()
  gender: string

  @IsNotEmpty()
  @IsString() 
  employer_id: string;

  @IsNotEmpty()
  @IsNumber()
  total_workExperience: number;

  @IsNotEmpty()
  @IsString()
  is_active: string;
}

export class UpdateEmployerDto{
  @IsOptional()
  @IsString()
  first_name: string;
  
  @IsOptional()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsDate()
  date_of_joined: Date;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  employer_id: string;

  @IsOptional()
  @IsNumber()
  total_workExperience: number;

  @IsString()
  @IsOptional()
  is_active: string

}

export class SearchEmployeeDto {
  @IsOptional()
    readonly skill_id: ObjectId[]
  
    @IsOptional()
    readonly experience: number[]
  
    @IsEnum(['Active', 'Disabled', 'Archived'])
    @IsOptional()
    readonly is_active: string[]
  
    @IsOptional()
    readonly search: string
  
    @IsOptional()
    readonly sort: string
  
   
    
  
  }