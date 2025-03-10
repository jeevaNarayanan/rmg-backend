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
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class PrimaryContactDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsNotEmpty()
    @IsNumber()
    mobile_number: number;
  }
  
  export class ContactInformationDto {
    @IsNotEmpty()
    @IsEmail()
    account_email: string;
  
    @IsNotEmpty()
    @IsNumber()
    account_number: number;
  
    @IsOptional()
    @IsString()
    address?: string;
  }
  
  export class CreateAccountDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @MaxLength(10)
    account_code: string;
  
    @IsArray()
    @Type(() => PrimaryContactDto)
    primary_contact: PrimaryContactDto[];
  
    @IsArray()
    @Type(() => ContactInformationDto)
    contact_information: ContactInformationDto[];
  
    @IsNotEmpty()
    @IsEnum(['Active', 'In-Active'])
    status: string;
  }
  