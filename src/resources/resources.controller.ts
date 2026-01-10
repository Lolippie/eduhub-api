
import { Controller, HttpCode, Delete, Param, Get, Request, Response, NotFoundException} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { Role } from 'generated/prisma';
import { Roles} from 'src/auth/decorators/roles.decorator';
import { CoursesService } from 'src/courses/courses.service';
import { join } from 'node:path';
import * as fs from 'node:fs';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';



@Controller('resources')
export class ResourcesController {

  constructor(private readonly resourcesService: ResourcesService, private readonly coursesService : CoursesService) { }

    @Roles(Role.ADMIN, Role.TEACHER)
    @HttpCode(200)
    @Delete('/:id')
    async deleteResource(@Param('id') id: string) {
      return this.resourcesService.deleteResource(id);
    }


    @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
    @HttpCode(200)
    @Get('/:id/download')
    async getResource(@Param('id') id: string, @Response() res, @Request() req) {
        const user = req.user;

        const resource = await this.resourcesService.getResource(id);
        if (!resource) {
            throw new Error('Resource not found');
        }

        const course = await this.coursesService.getCourse(resource.courseId);
        if (!course) { 
            throw new Error('Associated course not found');
        }

        if (user.role === Role.STUDENT) {
            const isEnrolled = await this.coursesService.getCourseByStudentId(user.id, course.id);
            if (!isEnrolled) {
                throw new Error('The student is not enrolled in the course associated with this resource');
            }
        }

        if (user.role === Role.TEACHER && course.teacherId !== user.id) {
            throw new Error('The teacher is not assigned to the course associated with this resource');
        }

        const filePath = join(process.cwd(), resource.fileUrl);
        await fs.promises.stat(filePath).catch(() => { throw new NotFoundException('Fichier introuvable'); });

        res.set({
            'Content-Type': resource.type,
            'Content-Disposition': `attachment; filename="${resource.fileName}"`,
            'Content-Length': resource.size
        });

        const stream = fs.createReadStream(filePath);
        stream.on('error', (err) => { throw new InternalServerErrorException(); });
        stream.pipe(res);
    }
}