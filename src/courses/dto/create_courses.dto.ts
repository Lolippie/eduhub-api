import { Optional } from "@nestjs/common";
import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";
import { Ressource, User } from "generated/prisma";

export class CreateCourseDto{
    @ApiProperty()
    @IsString()
    title:string;

    @ApiProperty()
    @IsString()
    ressources:Ressource[];

    @ApiProperty()
    @IsString()
    @IsOptional()
    teacherId:string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    students:User[];
}