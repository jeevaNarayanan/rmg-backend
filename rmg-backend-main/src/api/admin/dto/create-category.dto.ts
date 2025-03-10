import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  is_active: string;


  // @IsString()
  // @Length(1, 10)
  // category_code: string;

}
