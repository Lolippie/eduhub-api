import { Injectable} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CoursesService } from 'src/courses/courses.service';

@Injectable()
export class ResourcesService {
    constructor(private readonly prismaService: PrismaService, private readonly coursesService: CoursesService) { }

    async getResource(id: string){
        const resource = await this.prismaService.resource.findUnique({
            where: {id}
        });
        return resource;
    }

    async deleteResource(id: string){
        const resource = await this.prismaService.resource.delete({
            where: {id}
        });
        return resource;
    }

    async createResource(
        idCourse:string, 
        name: string, 
        fileName: string,
        fileUrl: string, 
        type: string,
        size: number){
        const resource = await this.prismaService.resource.create({
            data: {
                fileUrl,
                fileName,
                courseId: idCourse,
                name,
                size,
                type
            }
        });
        return resource;
    }

    async getResourcesByCourse(idCourse: string){
        const resources = await this.prismaService.resource.findMany({
            where: {courseId: idCourse}
        });
        return resources;
    }
}