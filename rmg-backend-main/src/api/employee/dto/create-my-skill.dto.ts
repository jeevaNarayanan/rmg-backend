import { IsMongoId, IsEnum, IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMySkillDto {
  @IsMongoId()
  skill_id: Types.ObjectId;

  @IsNumber()
  experience: number;

  @IsString()
  // @IsEnum(['active', 'disabled', 'archived'])
  is_active: string;
}
