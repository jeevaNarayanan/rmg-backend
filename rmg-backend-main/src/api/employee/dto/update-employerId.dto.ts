import { IsNumber, IsString } from "class-validator";


export class UpdateEmployerIdDto{

    @IsString()
    first_name : string;

    @IsString()
    last_name : string;

    @IsNumber()
    country_code: number;

    @IsNumber()
    mobile_number: number;

    @IsString()
    gender: string;

    @IsString()
    address: string;

    @IsString()
    profile: string;


}