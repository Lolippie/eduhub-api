import { Optional } from "@nestjs/common";
import {ApiProperty} from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {IsArray, IsOptional, IsString} from "class-validator";
import { Resource, User } from "generated/prisma";

export class CreateCourseDto{
    @ApiProperty()
    @IsString()
    title:string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    teacherId:string;

    @ApiProperty()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) =>
        typeof value === 'string' ? JSON.parse(value) : value
    )
    idsStudent:string[];

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) =>
        typeof value === 'string' ? JSON.parse(value) : value
    )
    titlesResource: string[];
}