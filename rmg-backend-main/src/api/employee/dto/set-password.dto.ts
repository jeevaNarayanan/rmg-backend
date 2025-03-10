import { IsNotEmpty } from 'class-validator';

export class SetPasswordDto {
  @IsNotEmpty()
  readonly password: string;
}
