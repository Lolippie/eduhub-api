import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches } from "class-validator";
import { Role } from "generated/prisma";

export class SetUpDto{
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
    firstName:string;

    @IsString()
    @ApiProperty()
    lastName:string;

    @IsString()
    @ApiProperty()
    role:Role;
}