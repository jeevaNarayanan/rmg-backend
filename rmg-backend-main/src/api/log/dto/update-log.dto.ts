import { IsBoolean, IsDate, IsEmpty, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateLogDto {
  @IsString()
  log_time: number;

  @IsString()
  activity: string;


  @IsEmpty()
  @IsDate()
  date:Date;

}


