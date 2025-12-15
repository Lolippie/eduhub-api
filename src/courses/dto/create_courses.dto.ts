import { Optional } from "@nestjs/common";
import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";

export class CreateCourseDto{
    @ApiProperty()
    @IsString()
    title:string;

    @ApiProperty()
    @IsString()
    contenu:string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    idTeacher:string;
}