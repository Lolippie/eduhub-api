import {ApiProperty, PartialType} from "@nestjs/swagger";
import { CreateCourseDto } from "./create_courses.dto";
import { IsArray, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateCoursDto extends PartialType(CreateCourseDto)
{
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
}