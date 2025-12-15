import {PartialType} from "@nestjs/swagger";
import { CreateCourseDto } from "./create_courses.dto";

export class UpdateCoursDto extends PartialType(CreateCourseDto){}