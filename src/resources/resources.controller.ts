
import { Controller, HttpCode, Delete, Param, Get, Request, Response, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { Role } from 'generated/prisma';
import { Roles} from 'src/auth/decorators/roles.decorator';
import { CoursesService } from 'src/courses/courses.service';
import { join } from 'node:path';
import * as fs from 'node:fs';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('resources')
@ApiBearerAuth()
@Controller('resources')
export class ResourcesController {

  constructor(private readonly resourcesService: ResourcesService, private readonly coursesService : CoursesService) { }

    @Roles(Role.ADMIN, Role.TEACHER)
    @HttpCode(200)
    @Delete('/:id')
    @ApiOperation({ summary: 'Supprimer une ressource par ID' })
    @ApiParam({ name: 'id', type: String, description: 'ID de la ressource à supprimer' })
    @ApiResponse({ status: 200, description: 'Ressource supprimée avec succès.' })
    @ApiResponse({ status: 403, description: 'Non autorisé à supprimer cette ressource.' })
    @ApiResponse({ status: 404, description: 'Ressource non trouvée.' })
    async deleteResource(@Param('id') id: string, @Request() req) {
        const user = req.user;

        const resource = await this.resourcesService.getResource(id);

        const course = await this.coursesService.getCourse(resource.courseId);

        if (user.role === Role.TEACHER && course.teacher?.id !== user.id) {
            throw new ForbiddenException('Teacher not assigned to associated course');
        }

      return this.resourcesService.deleteResource(id);
    }


    @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
    @HttpCode(200)
    @Get('/:id/download')
    @ApiOperation({ summary: 'Télécharger une ressource par ID' })
    @ApiParam({ name: 'id', type: String, description: 'ID de la ressource à télécharger' })
    @ApiResponse({ status: 200, description: 'Téléchargement du fichier.' })
    @ApiResponse({ status: 403, description: 'Non autorisé à accéder à cette ressource.' })
    @ApiResponse({ status: 404, description: 'Fichier introuvable.' })
    @Get('/:id/download')
    async getResource(@Param('id') id: string, @Response() res, @Request() req) {
        const user = req.user;

        const resource = await this.resourcesService.getResource(id);

        const course = await this.coursesService.getCourse(resource.courseId);

        if (user.role === Role.STUDENT) {
            await this.coursesService.getCourseByStudentIdAndCourseId(user.id, course.id);
        }

        if (user.role === Role.TEACHER && course.teacher?.id !== user.id) {
            throw new ForbiddenException('Teacher not assigned to associated course');
        }

        const filePath = join(process.cwd(), resource.fileUrl);
        await fs.promises.stat(filePath).catch(() => { throw new NotFoundException('Fichier introuvable'); });

        res.set({
            'Content-Type': resource.type,
            'Content-Disposition': `attachment; filename="${resource.fileName}"`,
            'Content-Length': resource.size
        });

        const stream = fs.createReadStream(filePath);
        stream.on('error', (err) => {
            res.status(500).end();
        });
        stream.pipe(res);
    }
}