import { Injectable} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {CreateCourseDto} from "./dto/create_courses.dto";
import {UpdateCoursDto} from "./dto/update_courses.dto";
import { CourseResourcesDto } from './dto/course_resources.dto';
import { Resource } from 'generated/prisma';

@Injectable()
export class CoursesService {
    constructor(private readonly prismaService: PrismaService) { }

    async getCourses(){
        const courses = await this.prismaService.course.findMany();
        return courses;
    }

    async getCoursesStudent(studentId: string){
        const courses = await this.prismaService.course.findMany({
            include:{
                students:{
                    where:{id: studentId}
                }
            }
        });
        return courses;
    }

     async getCoursesTeacher(teacherId: string){
        const courses = await this.prismaService.course.findMany({
            include:{
                teacher:{
                    where:{id: teacherId}
                }
            }
        });
        return courses;
    }

    async getCourse(id: string){
        const courses = await this.prismaService.course.findUnique(
            {where: {id}}
        );
        return courses;
    }

    async getCourseWithStudents(id: string){
        const course = await this.prismaService.course.findUnique({
            where: { id },
            include: { students: true },
        });
        return course;
    }

    async getCourseByStudentId(idStudent: string, idCourse:string){
        const courses = await this.prismaService.course.findUnique(
            {
            where: {id:idCourse},
            include:{ students: {where: {id:idStudent}
            }}
        }
        );
        return courses;
    }

   async createCourse(dto: CreateCourseDto) {
  const data: any = {
    title: dto.title,
    ...(dto.teacherId && { teacher: { connect: { id: dto.teacherId } } }),
    ...(dto.students && { students: { connect: { id: dto.students }} }),
    ...(dto.ressources && { ressources: dto.ressources }),
  };
  try {
    return await this.prismaService.course.create({
      data,
      include: { students: { select: { id: true } }, teacher: true, ressources: true },
    });
  } catch (err) {
    throw new Error('Course creation failed: ' + err.message);
  }
}

    async deleteCourse(id:string){
        const course = await this.prismaService.course.delete({
            where : {id},
        })
        return course;
    }

    
    async updateCourse(dto: UpdateCoursDto, id: string){
        const data: any = {
            title: dto.title,
            ...(dto.teacherId && { teacher: { connect: { id: dto.teacherId } } }),
            ...(dto.students && { students: { connect: { id: dto.students }} }),
            ...(dto.ressources && { ressources: dto.ressources }),
        };
        const course = await this.prismaService.course.update({
            where : {id},
            data,
        })
        return course;
    }
    
    async addResourcesToCourse(resource: Resource, id:string){

        const updatedCourse = await this.prismaService.course.update({
            data: {ressources: {connect: {id: resource.id}}},
            where: { id }
        });
        return updatedCourse;
    }

    async enrollStudentToCourse(studentIds: string[], courseId: string) {
         const connectItems = studentIds.map((id) => ({ id }));
         const updatedCourse = await this.prismaService.course.update({
             where: { id: courseId },
             data: {
                 students: {
                     connect: connectItems,
                 },
             },
         });
         return updatedCourse;
    }

    async unenrollStudentToCourse(studentIds: string[], courseId: string) {
        const disconnectItems = studentIds.map((id) => ({ id }));
        const updatedCourse = await this.prismaService.course.update({
            where: { id: courseId },
            data: {
                students: {
                    disconnect: disconnectItems,
                },
            },
        });
        return updatedCourse;
    }
}
