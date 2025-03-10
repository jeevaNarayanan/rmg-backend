import { IsString, IsOptional } from 'class-validator';

export class CreateMasterDto {
  @IsString()
  type: string;

  @IsString()
  value: string;

}



export class UpdateMasterDto {
  @IsString()
  @IsOptional()
  value?: string;
}
