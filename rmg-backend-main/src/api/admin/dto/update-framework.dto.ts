import { IsOptional, IsString, IsArray, IsBoolean, IsMongoId } from 'class-validator';

export class UpdateFrameworkDto {
  @IsOptional()
  @IsString()
  name?: string; 

  @IsOptional()
  @IsBoolean()
  is_Active?: boolean; 

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  skill?: string[]; 
}
