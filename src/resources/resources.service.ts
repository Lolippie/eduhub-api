import { Injectable, NotFoundException, Inject, forwardRef, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CoursesService } from 'src/courses/courses.service';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CourseResourcesDto } from 'src/courses/dto/course_resources.dto';

@Injectable()
export class ResourcesService {
    constructor(
        private readonly prismaService: PrismaService,
        @Inject(forwardRef(() => CoursesService))
        private readonly coursesService: CoursesService,
    ) { }

    async getResource(id: string){
        const resource = await this.prismaService.resource.findUnique({
            where: {id}
        });

        if (!resource) throw new NotFoundException('Resource not found');
        
        return resource;
    }

    async deleteResource(id: string){
        const resourceToDelete = await this.getResource(id);

        if (!resourceToDelete) throw new NotFoundException('Resource not found');

        const filePath = path.resolve(resourceToDelete.fileUrl);

        const uploadsBase = path.resolve(
            process.cwd(),
            'uploads',
            'courses',
            resourceToDelete.courseId,
        );

        if(!filePath.startsWith(uploadsBase)) throw new NotFoundException('Invalid file path');

        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } catch (err) {
            throw new UnauthorizedException(
                'Error deleting file: ' + err.message
        );
    }

        const resource = await this.prismaService.resource.delete({
            where: {id}
        });

        if (!resource) throw new NotFoundException('Resource not found');

        return { "message": "Resource deleted successfully"};
    }

async createResources(idCourse: string, dto: CourseResourcesDto[], files: Express.Multer.File[]) {
        const sizeFiles = files ? files.length : 0;
        const dtoTitlesSize = dto ? dto.length : 0;
        if(sizeFiles !== dtoTitlesSize){
            throw new UnauthorizedException('The number of courses and files do not match');
        }

        const folderPath = path.join(process.cwd(), 'uploads', 'courses', idCourse);

        if (!fs.existsSync(folderPath)) throw new NotFoundException('Course folder does not exist');

        if (files && files.length > 0) {
            await Promise.all(
                files.map((file, i) => this.createResource(idCourse, dto[i].title, file)),
            );

            const resources = await this.getResourcesByCourse(idCourse);

            return resources;
        }
            throw new NotFoundException('No files provided');
}


async createResource(idCourse: string, courseResourceTitle: string, file: Express.Multer.File) {
    await this.coursesService.getCourse(idCourse);

    const dirPath = path.join('uploads', 'courses', idCourse);
    await fs.promises.mkdir(dirPath, { recursive: true });

    const ext = path.extname(file.originalname);

        const baseName = (courseResourceTitle || path.basename(file.originalname, ext))
            .toString()
            .trim()
            .replaceAll(/[^a-zA-Z0-9-_ ]/g, '_');

        let fileName = `${baseName}${ext}`;
        let filePath = path.join(dirPath, fileName);
        let counter = 1;

        while (true) {
            try {
                const handle = await fs.promises.open(filePath, 'wx');
                try {
                    await handle.writeFile(file.buffer);
                } finally {
                    await handle.close();
                }
                break;
            } catch (err: any) {
                if (err && (err.code === 'EEXIST' || err.code === 'EACCES')) {
                    fileName = `${baseName}(${counter})${ext}`;
                    filePath = path.join(dirPath, fileName);
                    counter++;
                    continue;
                }
                throw new UnauthorizedException('Error saving file: ' + (err?.message ?? err));
            }
        }

    const resource = await this.prismaService.resource.create({
        data: {
            fileUrl: filePath,
            fileName: fileName,
            courseId: idCourse,
            name: courseResourceTitle,
            size: file.size,
            type: file.mimetype
        }
    });
    if (!resource) throw new NotFoundException('Error creating resource');
    return resource;
}

    async getResourcesByCourse(idCourse: string){
        const resources = await this.prismaService.resource.findMany({
            where: {courseId: idCourse}
        });

        if (!resources) throw new NotFoundException('No resources found for this course');
        
        return resources;
    }

}