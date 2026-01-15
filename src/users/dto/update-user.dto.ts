import {ApiProperty, PartialType} from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsEmail, IsString } from "class-validator";


export class UpdateUserDto{ 
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
    password:string;
}       