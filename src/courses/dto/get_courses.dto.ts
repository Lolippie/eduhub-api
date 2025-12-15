import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class GetCoursesDto{
    @IsString()
    @ApiProperty()
    nom:string;

    @IsString()
    @ApiProperty()
    contenu:string;
}       