import { IsNotEmpty } from "class-validator"

export class VerifyEmployerOtpDto{
    @IsNotEmpty()
    readonly _id: string
    @IsNotEmpty()
    readonly token: string
}