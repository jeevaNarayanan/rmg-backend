import {
    IsArray,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    IsEmail,
    IsNumber,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class PrimaryContactDto {

    @IsString()
    name?: string;
  
   
    @IsEmail()
    email?: string;
  
    
    @IsNumber()
    mobile_number?: number;
  }
  
  export class ContactInformationDto {
    @IsOptional()
    @IsEmail()
    account_email?: string;
  
    @IsOptional()
    @IsNumber()
    account_number?: number;
  
    @IsOptional()
    @IsString()
    address?: string;
  }
  
  export class UpdateAccountDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(10)
    account_code?: string;
  
    @IsOptional()
    @IsArray()
    @Type(() => PrimaryContactDto)
    primary_contact?: PrimaryContactDto[];
  
    @IsOptional()
    @IsArray()
    @Type(() => ContactInformationDto)
    contact_information?: ContactInformationDto[];
  
    @IsOptional()
    @IsEnum(['Active', 'In-Active'])
    status?: string;
  }
  