import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  UploadedFiles,
  Body,
  Request,
  ForbiddenException,
  UseInterceptors,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create_courses.dto';
import { UpdateCoursDto } from './dto/update_courses.dto';
import { Admin, Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Role, User } from 'generated/prisma';
import { UsersService } from 'src/users/users.service';
import { createFilesValidationPipe } from './pipes/parse-file.pipe';
import { ResourcesService } from 'src/resources/resources.service';
import { CourseResourcesDto } from './dto/course_resources.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly resourcesService: ResourcesService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Récupère tous les cours selon le rôle de l’utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des cours récupérée' })
  async getCourses(@Request() req) {
    const user = req.user as User;
    if (user.role === Role.STUDENT)
      return await this.coursesService.getCoursesStudent(user.id);

    if (user.role === Role.TEACHER)
      return await this.coursesService.getCoursesTeacher(user.id);

    return this.coursesService.getCourses();
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Créer un cours avec éventuellement des fichiers attachés' })
  @ApiBody({ type: CreateCourseDto })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Cours créé avec succès' })
  async createCourse(
    @UploadedFiles(createFilesValidationPipe(false)) files: Express.Multer.File[],
    @Body() createCourseDto: CreateCourseDto,
    @Request() req,
  ) {
    const user = req.user as User;
    if (user.role === Role.TEACHER) {
      createCourseDto.teacherId = user.id;
    }
    return this.coursesService.createCourse(createCourseDto, files);
  }

  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  @ApiOperation({ summary: 'Récupère un cours par son ID' })
  @ApiResponse({ status: 200, description: 'Cours récupéré' })
  @ApiResponse({ status: 403, description: 'Accès refusé au cours' })
  async getCourse(@Param('id') idCourse: string, @Request() req) {
    const user = req.user as User;
    if (user.role === Role.STUDENT)
      return await this.coursesService.getCourseByStudentIdAndCourseId(
        user.id,
        idCourse,
      );

    const course = await this.coursesService.getCourse(idCourse);

    if (user.role === Role.TEACHER && course.teacher?.id !== user.id)
      throw new ForbiddenException('The teacher does not manage this course');

    return course;
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(200)
  @Patch('/:id')
  @ApiOperation({ summary: 'Met à jour un cours existant' })
  @ApiResponse({ status: 200, description: 'Cours mis à jour' })
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourse: UpdateCoursDto,
    @Request() req,
  ) {
    const course = await this.coursesService.getCourse(id);
    const user = req.user as User;

    if (user.role === Role.TEACHER && course.teacher?.id !== user.id)
      throw new ForbiddenException('You are not the teacher of this course');

    return this.coursesService.updateCourse(updateCourse, id);
  }

  @Admin()
  @HttpCode(200)
  @Delete('/:id')
  @ApiOperation({ summary: 'Supprime un cours (Admin uniquement)' })
  @ApiResponse({ status: 200, description: 'Cours supprimé' })
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(200)
  @Post('/:id/enroll')
  @ApiOperation({ summary: "Inscrire des étudiants à un cours" })
  @ApiBody({ description: 'Liste des IDs étudiants', type: [String] })
  @ApiResponse({ status: 200, description: 'Étudiants inscrits avec succès' })
  async enrollStudentToCourse(
    @Param('id') courseId: string,
    @Body('idsStudent') studentsIdsEnroll: string[],
    @Request() req,
  ) {
    const course = await this.coursesService.getCourse(courseId);
    const user = req.user as User;

    if (user.role == Role.TEACHER && user.id !== course.teacher?.id)
      throw new ForbiddenException('You are not the teacher of this course');

    await this.usersService.getUsersByIds(studentsIdsEnroll);
    return this.coursesService.enrollStudentToCourse(studentsIdsEnroll, courseId);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(200)
  @Post('/:id/unenroll')
  @ApiOperation({ summary: "Désinscrire des étudiants d'un cours" })
  @ApiBody({ description: 'Liste des IDs étudiants à désinscrire', type: [String] })
  @ApiResponse({ status: 200, description: 'Étudiants désinscrits avec succès' })
  async unenrollStudentToCourse(
    @Param('id') courseId: string,
    @Body("idsStudent") studentsIdsUnenroll: string[],
    @Request() req,
  ) {
    const course = await this.coursesService.getCourse(courseId);
    const user = req.user as User;

    if (course.teacher?.id === user.id || user.role === Role.ADMIN) {
      await this.usersService.getStudentsByIds(studentsIdsUnenroll);
      return this.coursesService.unenrollStudentToCourse(studentsIdsUnenroll, courseId);
    } else {
      throw new ForbiddenException('You are not the teacher of this course');
    }
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(200)
  @Post('/:id/resources')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Ajouter des ressources à un cours' })
  @ApiResponse({ status: 200, description: 'Ressources ajoutées avec succès' })
  async addResourcesToCourse(
    @UploadedFiles(createFilesValidationPipe(true)) files: Express.Multer.File[],
    @Param('id') idCourse: string,
    @Body('titles') titles: string,
    @Request() req,
  ) {
    const course = await this.coursesService.getCourse(idCourse);
    const user = req.user as User;

    if (user.role === Role.TEACHER && course.teacher?.id !== user.id)
      throw new ForbiddenException('You are not the teacher of this course');

    const dto: CourseResourcesDto[] = JSON.parse(titles);
    const resources = await this.resourcesService.createResources(
      idCourse,
      dto,
      files,
    );
    this.coursesService.addResourcesToCourse(resources, idCourse);

    const updatedCourse = await this.coursesService.getCourse(idCourse);
    return { message: 'Resources added successfully', updatedCourse };
  }

  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @HttpCode(200)
  @Get('/:id/resources')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Récupérer les ressources d’un cours' })
  @ApiResponse({ status: 200, description: 'Ressources récupérées avec succès' })
  async getResourcesFromCourseId(
    @Param('id') id:string, 
    @Request() req
  ){
    const course = await this.coursesService.getCourse(id);
    const user = req.user as User;

    if(user.role === Role.STUDENT){
      const courseStudent = await this.coursesService.getCourseByStudentIdAndCourseId(user.id, course.id);
      return this.coursesService.getCourseResources(courseStudent.id)
    }
    if(user.role === Role.TEACHER && course.teacher?.id !== user.id){
        throw new ForbiddenException("You don't have access to the resources of this course");
    }
    
    return this.coursesService.getCourseResources(id);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.OK)
  @Get('/:id/students')
  @ApiOperation({ summary: 'Récupérer les étudiants d’un cours' })
  @ApiResponse({ status: 200, description: 'Liste des étudiants récupérée' })
  async getStudentsFromCourseId(@Param('id') idCourse: string, @Request() req) {
    const user = req.user as User;
    const course = await this.coursesService.getCourse(idCourse);

    if(user.role === Role.TEACHER && course.teacher?.id !== user.id){
        throw new ForbiddenException("You don't have access to this course");
    }
    if(course.students.length === 0){
      return { message: 'No students enrolled in this course', students: [] };
    }
    return course.students;
  }
}