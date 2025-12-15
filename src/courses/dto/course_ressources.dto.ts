import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class CourseRessourcesDto{
    @ApiProperty()
    @IsString()
    title:string;

    
}