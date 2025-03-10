import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Types } from 'mongoose';

export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  log_time: number;

  @IsString()
  @IsNotEmpty()
  action: string;


  @IsDate()
  @IsNotEmpty()
  date:Date;

}


