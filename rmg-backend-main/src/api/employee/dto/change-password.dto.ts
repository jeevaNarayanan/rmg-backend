import { IsNotEmpty, IsOptional } from "class-validator"

export class ChangePasswordDto{
    @IsOptional()
    readonly currentPassword: string
    @IsNotEmpty()
    readonly newPassword: string
}