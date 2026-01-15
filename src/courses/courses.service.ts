import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {CreateCourseDto} from "./dto/create_courses.dto";
import {UpdateCoursDto} from "./dto/update_courses.dto";
import { Resource } from 'generated/prisma';
import { ResourcesService } from 'src/resources/resources.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'generated/prisma';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CoursesService {
    constructor(private readonly prismaService: PrismaService, private readonly resourcesService : ResourcesService, private readonly usersServices : UsersService ) { }

    async getCourses(){
        const courses = await this.prismaService.course.findMany({
            select: {
                id: true,
                title: true,
                teacher: 
                {
                    select: { 
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },
                students: { 
                    select: { id: true, 
                    email: true,
                    firstName: true,
                    lastName: true
                }}
            }
        })
        if(!courses){
            throw new NotFoundException('No courses found');
        }

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

        if(!courses) throw new NotFoundException('No courses found for this student');

        return courses;
    }


    async getCoursesTeacher(teacherId: string){
        const teacher = await this.usersServices.getTeacherById(teacherId);
        if(teacher.managedCourses.length === 0) throw new NotFoundException('No courses found for this teacher');
        return teacher.managedCourses;
    }


    async getCourse(id: string){
        const courses = await this.prismaService.course.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                title: true,
                teacher: {
                    select: { 
                        id: true, 
                        email: true, 
                        firstName: true, 
                        lastName: true
                    }
                },
                students: { 
                    select: { 
                        id: true, 
                        email: true, 
                        firstName: true, 
                        lastName: true
                    } 
                },
                ressources: true,
            },
        });

        if(!courses) throw new NotFoundException('Course not found');

        return courses;
    }


    async getStudentsFromCourseId(id: string){
        const course = await this.prismaService.course.findUnique({
            where: { 
                id 
            },
            select: { 
                students: true 
            },
        });
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async getCourseByStudentIdAndCourseId(idStudent: string, idCourse:string){
        const course = await this.prismaService.course.findUnique({
            where: {
                id: idCourse
            },
            select:{ 
                id: true,
                title: true,
                teacher: {
                    select: { 
                        id: true, 
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },
                students: {
                    where: {
                        id: idStudent
                    },
                    select: { 
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        if(!course) throw new ForbiddenException('The student is not enrolled in this course');

        return course;
    }

    async createCourse(dto: CreateCourseDto, files?: Express.Multer.File[]){
        const sizeFiles = files ? files.length : 0;
        const dtoTitlesSize = dto.titlesResource ? dto.titlesResource.length : 0;
        if(sizeFiles !== dtoTitlesSize){
            throw new UnauthorizedException('The number of courses and files do not match');
        }
        let students: User[] = [];
        if(dto.teacherId) await this.usersServices.getTeacherById(dto.teacherId);
        
        if(dto.idsStudent) {students = await this.usersServices.getStudentsByIds(dto.idsStudent);}
        let data: any = {
            title: dto.title,
            ...(dto.teacherId && { teacher: { connect: { id: dto.teacherId } } }),
            ...(dto.idsStudent && { students: { connect: students} })
        };

        const course = await this.prismaService.course.create({
            data,
            include: { 
                students: {
                    select: { 
                        id: true 
                    } 
                },
                ressources: dto.titlesResource ? dto.titlesResource.length > 0 : false
            },
        })
        if (!course) throw new NotFoundException('Course creation failed');
        
        const folderPath = path.join(process.cwd(), 'uploads', 'courses', course.id);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        if (files && files.length > 0) {
            await Promise.all(
                files.map((file, i) => this.resourcesService.createResource(course.id, dto.titlesResource[i], file)),
            );

            const updatedCourse = await this.getCourse(course.id);

            return { message: 'Course created successfully', course: updatedCourse };
        }

        return { message: 'Course created successfully', course: course };
    }
            
    
    async deleteCourse(id:string){
        try {
            await this.prismaService.course.delete({
                where: {id},
            })
        }
        catch{
            throw new NotFoundException('Course not found');
        }
        
        return {"message" : "The course has been deleted"};
    }

    
    async updateCourse(dto: UpdateCoursDto, idCourse: string){

        if (dto.teacherId) await this.usersServices.getTeacherById(dto.teacherId);
        if (dto.idsStudent) await this.usersServices.getStudentsByIds(dto.idsStudent);
        const data: any = {
            title: dto.title,
            ...(dto.teacherId && { teacher: { connect: { id: dto.teacherId } } }),
            ...(dto.idsStudent && { students: { connect: dto.idsStudent.map(id => ({ id })) } })
        };

        const course = await this.prismaService.course.update({
            where: { id: idCourse },
            data,
            select: {
                id: true,
                title: true,
                teacher: {
                    select: { 
                        id: true, 
                        email: true, 
                        firstName: true, 
                        lastName: true
                    }
                },
                students: { 
                    select: { 
                        id: true, 
                        email: true, 
                        firstName: true, 
                        lastName: true,
                    } 
                },
                ressources: true,
            },
        })

        if(!course) throw new NotFoundException('Course not found');

        return course;
    }
    

    async addResourcesToCourse(resources: Resource[], id:string){

        let data:any = {
            resources: { connect: { id: resources.map(r =>  r.id) } }
        };
        const updatedCourse = await this.prismaService.course.update({
            where: { id },
            data,
            select: { ressources: true }
        });
        
        if(!updatedCourse) throw new NotFoundException('Course not found');

        return updatedCourse;
    }

    async getCourseResources(courseId: string){
        const resources = await this.prismaService.resource.findMany({
            where: {
                courseId: courseId
            }
        });

        if (!resources) throw new NotFoundException('No resources found for this course');

        return resources;
    }

    async enrollStudentToCourse(studentsIds: string[], courseId: string) {
        this.usersServices.getStudentsByIds(studentsIds);
        const connectItems = studentsIds.map((id) => ({ id }));
        const updatedCourse = await this.prismaService.course.update({
            where: { id: courseId },
            data: {
                students: {
                    connect: connectItems,
                },
            },
            select: {
                id:true,
                title:true,
                teacher: {
                    select : {
                        id:true,
                        email:true,
                        firstName:true,
                        lastName:true
                    }
                },
                students : {
                    select : {
                        id:true,
                        email:true,
                        firstName:true,
                        lastName:true
                    }
                },
            }
        });

        if(!updatedCourse) throw new NotFoundException('Course not found');
        
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
            select: {
                id:true,
                title:true,
                teacher: {
                    select : {
                        id:true,
                        email:true,
                        firstName:true,
                        lastName:true
                    }
                },
                students : {
                    select : {
                        id:true,
                        email:true,
                        firstName:true,
                        lastName:true
                    }
                },
            }
        });
        return updatedCourse;
    }
}
