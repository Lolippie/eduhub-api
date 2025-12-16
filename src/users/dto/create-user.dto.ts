import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsString, Matches} from "class-validator";
import { Role } from "generated/prisma";

export class CreateUserDto{
    @IsString()
    @IsEmail()
    @ApiProperty()
    email:string;

    @IsString()
    @ApiProperty()
    firstName:string;

    @IsString()
    @ApiProperty()
    lastName:string;

    @IsString()
    @ApiProperty()
    @Matches(/^\d{6}$/, { message: 'PIN must be a 6-digit number' })
    pin:string;

    @IsString()
    @ApiProperty()
    password:string;

    @IsString()
    @ApiProperty()
    role:Role;
}       