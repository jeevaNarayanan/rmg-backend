import { IsString, IsBoolean, IsOptional, Length, Matches, IsArray, IsMongoId, IsNotEmpty } from 'class-validator';
import { ObjectId, Types } from 'mongoose';

export class CreateSkillDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 10)
  skills_code: string;

  @IsBoolean()
  is_Active: boolean;

  @IsOptional()
  version?: number;

  @IsNotEmpty()
  @IsMongoId()
  category: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  skill_type: Types.ObjectId;
  
  

}
