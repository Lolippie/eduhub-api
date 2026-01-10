import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class CourseResourcesDto{
    @ApiProperty()
    @IsString()
    title:string;
    
}