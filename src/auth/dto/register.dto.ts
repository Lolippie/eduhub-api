import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches } from "class-validator";

export class RegisterDto{
    @IsString()
    @IsEmail()
    @ApiProperty()
    email:string;

    @IsString()
    @ApiProperty()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, { message: 'Password must be at least 6 characters long and contain at least one letter and one number' })
    password:string;

    @IsString()
    @ApiProperty()
    @Matches(/^\d{6}$/, { message: 'PIN must be a 6-digit number' })
    pin:string;
}