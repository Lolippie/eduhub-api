import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseInterceptors, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create_courses.dto';
import { UpdateCoursDto } from './dto/update_courses.dto';
import { CourseResourcesDto } from './dto/course_resources.dto';
import { Admin, Roles, Student} from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { Role, User } from 'generated/prisma';
import { UsersService } from 'src/users/users.service';

@Controller('courses')
export class CoursesController {

  constructor(private readonly coursesService: CoursesService, private readonly usersService: UsersService) { }
    
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get("")
  async getCourses(@Request() req) {
    const user = req.user as User;
    if(user.role === Role.STUDENT){
      const studentCourses = await this.coursesService.getCoursesStudent(user.id);
      if(!studentCourses){
        throw new Error('No courses found for this student');
      }
      return studentCourses;
    }
    if(user.role === Role.TEACHER){
      const teacherCourses = await this.coursesService.getCoursesTeacher(user.id);
      if(!teacherCourses){
        throw new Error('No courses found for this teacher');
      }
      return teacherCourses;
    }
    return this.coursesService.getCourses();
}

  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('/:id')
  async getCourse(@Param('id') idCourse: string, @Request() req) {
    const user = req.user as User;
    if(user.role === Role.STUDENT){
      const course = await this.coursesService.getCourseStudent(user.id, idCourse);
      if(!course){
        throw new Error('The student is not enrolled in this course');
      }
      return course;
    }
    const course = await this.coursesService.getCourse(idCourse);
    if (!course) {
        throw new Error('Course not found');
    }
    if(!(user.role === Role.TEACHER && course.teacherId === user.id)){
        throw new Error('The teacher does not managed this course');
    }
    return course;
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @Post('courses')
  async createCourse(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    const user = req.user as User;
    if(user.role === Role.TEACHER){
      createCourseDto.teacherId = user.id;
    }
    return this.coursesService.createCourse(createCourseDto);
  }

  @Admin()
  @HttpCode(200)
  @Delete('courses/:id')
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
  

  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(200)
  @Post('courses/:id')
  async updateCourse(@Param('id') id:string, @Body() updateCourse: UpdateCoursDto, @Request() req) {
      const course = await this.coursesService.getCourse(id);
        if (!course) {
            throw new Error('Course not found');
        }
        const user = req.user as User;

        if(course.teacherId == user.id || user.role == Role.ADMIN){
          return this.coursesService.updateCourse( updateCourse, id);
        }
  }
  
    @Roles(Role.ADMIN, Role.TEACHER)
    @HttpCode(200)
  @Post('/:id/resources')
    @UseInterceptors(FileInterceptor('file'))
  async addResourcesToCourse(
      @UploadedFile() file: Express.Multer.File, 
      @Param('id') id:string, 
    @Body() courseResources: CourseResourcesDto, 
      @Request() req) {
        const course = await this.coursesService.getCourse(id);
        if (!course) {
            throw new Error('Course not found');
        }
        const user = req.user as User;

        if(course.teacherId == user.id || user.role == Role.ADMIN){
        fs.writeFile('uploads/' + file.originalname, file.buffer, (err) => {
            if (err) {
                console.error('Error saving file:', err);
            } else {
                console.log('File saved successfully');
            }
        });
      return this.coursesService.addResourcesToCourse(courseResources, id);
      } else {
        throw new Error('You are not the teacher of this course');
      }
    }

    @Roles(Role.ADMIN, Role.TEACHER)
    @HttpCode(200)
  @Post('/:id/enroll')
    async enrollStudentToCourse(@Param('id') courseId: string, @Body() usersId: string[], @Request() req) {
      const course = await this.coursesService.getCourse(courseId);
        if (!course) {
            throw new Error('Course not found');
        }
        const user = req.user as User;

        if(course.teacherId == user.id || user.role == Role.ADMIN){
          const students = await this.usersService.getUsersByIds(usersId);
          if (!students || students.some((s) => !s)) {
            throw new Error('One or more users not found');
          }
          return this.coursesService.enrollStudentToCourse(usersId, courseId);
        }
        else {
        throw new Error('You are not the teacher of this course');
      }     
    }

    @Roles(Role.ADMIN, Role.TEACHER)
    @HttpCode(200)
  @Post('/:id/unenroll')
    async unenrollStudentToCourse(@Param('id') courseId: string, @Body() studentsIdsUnenroll: string[], @Request() req) {
      const course = await this.coursesService.getCourse(courseId);
        if (!course) {
            throw new Error('Course not found');
        }
        const user = req.user as User;

        if(course.teacherId == user.id || user.role == Role.ADMIN){
          return this.coursesService.unenrollStudentToCourse(studentsIdsUnenroll, courseId);
        } 
        else {
        throw new Error('You are not the teacher of this course');
      }     
    }
}