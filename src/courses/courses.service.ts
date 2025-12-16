import { Injectable} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {CreateCourseDto} from "./dto/create_courses.dto";
import {UpdateCoursDto} from "./dto/update_courses.dto";
import { CourseRessourcesDto } from './dto/course_ressources.dto';

@Injectable()
export class CoursesService {
    constructor(private prismaService: PrismaService) { }

    async getCourses(){
        const courses = await this.prismaService.course.findMany();
        return courses;
    }

    async getCourse(id: string){
        const courses = await this.prismaService.course.findUnique(
            {where: {id}}
        );
        return courses;
    }

    async createCourse(createCourseDto : CreateCourseDto){
        const course = await this.prismaService.course.create({
            data : createCourseDto,
        });
        return course;
    }

    async deleteCourse(id:string){
        const course = await this.prismaService.course.delete({
            where : {id},
        })
        return course;
    }

    
    async updateCourse(updateCourseDto: UpdateCoursDto, id: string){
        const course = await this.prismaService.course.update({
            data : updateCourseDto,
            where : {id},
        })
        return course;
    }
    
    async addRessourcesToCourse(courseRessources: CourseRessourcesDto, id:string){
        const updatedCourse = await this.prismaService.course.update({
            data: courseRessources,
            where: { id }
        });
        return updatedCourse;
    }

    async enrollStudentToCourse(studentId: string, courseId: string) {
         const updatedCourse = await this.prismaService.course.update({
             where: { id: courseId },
             data: {
                 students: {
                     ...this.enrollStudentToCourse, studentId
                 },
             },
         });
         return updatedCourse;
    }

    async unenrollStudentToCourse(studentId: string, courseId: string) {
        const updatedCourse = await this.prismaService.course.update({
            where: { id: courseId },
            data: {
                students: {
                    disconnect: { id: studentId },
                },
            },
        });
        return updatedCourse;
    }
}
