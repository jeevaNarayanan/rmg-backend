import { IsString, IsOptional, IsBoolean, IsArray, IsMongoId, IsNotEmpty } from 'class-validator';


export class CreateFrameworkDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;
  
    @IsOptional()
    @IsBoolean()
    readonly is_Active?: boolean;

    @IsOptional()
    @IsMongoId()
    readonly skill?: string;
  
  }
  