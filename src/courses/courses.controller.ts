import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UploadedFiles, UseInterceptors, Request, Patch, ForbiddenException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create_courses.dto';
import { UpdateCoursDto } from './dto/update_courses.dto';
import { Admin, Roles} from 'src/auth/decorators/roles.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Role, User } from 'generated/prisma';
import { UsersService } from 'src/users/users.service';
import { createFilesValidationPipe } from './pipes/parse-file.pipe';
import { ResourcesService } from 'src/resources/resources.service';
import { CourseResourcesDto } from './dto/course_resources.dto';


@Controller('courses')
export class CoursesController {

  constructor(
      private readonly coursesService: CoursesService, 
      private readonly usersService: UsersService, 
      private readonly resourcesService: ResourcesService) { }
    
  @HttpCode(HttpStatus.OK)
  @Get("")
  async getCourses(@Request() req) {
    const user = req.user as User;

    if(user.role === Role.STUDENT) return await this.coursesService.getCoursesStudent(user.id);

    if(user.role === Role.TEACHER) return await this.coursesService.getCoursesTeacher(user.id);

    return this.coursesService.getCourses();
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @Post("")
  @UseInterceptors(FilesInterceptor('files'))
  async createCourse(
    @UploadedFiles(createFilesValidationPipe(false)) files: Express.Multer.File[], 
    @Body() createCourseDto: CreateCourseDto, 
    @Request() req) {
    const user = req.user as User;
    if(user.role === Role.TEACHER){
      createCourseDto.teacherId = user.id;
    }

    return this.coursesService.createCourse(createCourseDto, files);
  }

  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getCourse(@Param('id') idCourse: string, @Request() req) {
    const user = req.user as User;

    if(user.role === Role.STUDENT) return await this.coursesService.getCourseByStudentIdAndCourseId(user.id, idCourse);
    
    const course = await this.coursesService.getCourse(idCourse);
   
    if(user.role === Role.TEACHER && course.teacher?.id !== user.id){
        throw new ForbiddenException('The teacher does not managed this course');
    }

    return course;
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(200)
  @Patch('/:id')
  async updateCourse(@Param('id') id:string, @Body() updateCourse: UpdateCoursDto, @Request() req) {
    const course = await this.coursesService.getCourse(id);

    const user = req.user as User;

    if(user.role === Role.TEACHER && course.teacher?.id !== user.id){
        throw new ForbiddenException('You are not the teacher of this course');
    }
    return this.coursesService.updateCourse(updateCourse, id);
  }

  @Admin()
  @HttpCode(200)
  @Delete('/:id')
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
  


  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(200)
  @Post('/:id/enroll')
  async enrollStudentToCourse(@Param('id') courseId: string, @Body("idsStudent") studentsIdsEnroll: string[], @Request() req) {
    const course = await this.coursesService.getCourse(courseId);

    const user = req.user as User;

    if(user.role == Role.TEACHER && user.id !== course.teacher?.id){
      throw new ForbiddenException('You are not the teacher of this course');
    }

    await this.usersService.getUsersByIds(studentsIdsEnroll);
    return this.coursesService.enrollStudentToCourse(studentsIdsEnroll, courseId);
  
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(200)
  @Post('/:id/unenroll')
  async unenrollStudentToCourse(@Param('id') courseId: string, @Body("idsStudent") studentsIdsUnenroll: string[], @Request() req) {
    const course = await this.coursesService.getCourse(courseId);

    const user = req.user as User;

    if(course.teacher?.id == user.id || user.role == Role.ADMIN){
      await this.usersService.getStudentsByIds(studentsIdsUnenroll);
      return this.coursesService.unenrollStudentToCourse(studentsIdsUnenroll, courseId);
    } 
    else {
      throw new ForbiddenException('You are not the teacher of this course');
    }     
  }
    
  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(200)
  @Post('/:id/resources')
  @UseInterceptors(FilesInterceptor('files'))
  async addResourcesToCourse(
    @UploadedFiles(createFilesValidationPipe(true)) files: Express.Multer.File[], 
    @Param('id') idCourse:string, 
    @Body('titles') titles: string, 
    @Request() req
  ){
    const course = await this.coursesService.getCourse(idCourse);

    const user = req.user as User;
    
    if (user.role === Role.TEACHER && course.teacher?.id !== user.id) throw new ForbiddenException('You are not the teacher of this course');
    const dto: CourseResourcesDto[] = JSON.parse(titles);
    const resources = await this.resourcesService.createResources(idCourse, dto, files);
    this.coursesService.addResourcesToCourse(resources, idCourse)
    const updatedCourse = await this.coursesService.getCourse(idCourse);
    return { message: 'Resources added successfully', updatedCourse};
  }

  
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @HttpCode(200)
  @Get('/:id/resources')
  @UseInterceptors(FileInterceptor('file'))
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
  async getStudentsFromCourseId(@Param('id') idCourse: string, @Request() req) {
    const user = req.user as User;
    const course = await this.coursesService.getCourse(idCourse);

    if(user.role === Role.TEACHER && course.teacher?.id !== user.id){
        throw new ForbiddenException("You don't have access this course");
    }
    if(course.students.length === 0){
      return { message: 'No students enrolled in this course', students: [] };
    }
    return course.students;
  }
}