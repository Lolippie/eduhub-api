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
    @Transform(({ value }) => {
    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
        try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
        return [value];
        }
    }

    return [value];
    })
    titlesResource: string[];

}