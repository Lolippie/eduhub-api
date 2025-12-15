import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseInterceptors, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create_courses.dto';
import { UpdateCoursDto } from './dto/update_courses.dto';
import { CourseRessourcesDto } from './dto/course_ressources.dto';
import { Admin, Student} from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { User } from 'generated/prisma';

@Controller('courses')
export class CoursesController {

      constructor(private coursesService: CoursesService) { }
    
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('id')
  async getCourses() {
    return this.coursesService.getCourses();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('id')
  async getCourse(@Param('id') id: string) {
    return this.coursesService.getCourse(id);
  }

  @Admin()
  @HttpCode(HttpStatus.CREATED)
  @Post('courses')
  async postCourse(@Body() createCourseDto: CreateCourseDto, ) {
    return this.coursesService.createCourse(createCourseDto);
  }

  @Admin()
  @HttpCode(200)
  @Delete('courses/:id')
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
  

  @Admin()
  @HttpCode(200)
  @Post('courses/:id')
  async updateCourse(@Param('id') id:string, @Body() updateCourse: UpdateCoursDto) {
    return this.coursesService.updateCourse( updateCourse, id);
  }
  
    @Admin()
    @HttpCode(200)
    @Post('courses/:id/ressources')
    @UseInterceptors(FileInterceptor('file'))
    async addRessourcesToCourse(
      @UploadedFile() file: Express.Multer.File, 
      @Param('id') id:string, 
      @Body() courseRessources: CourseRessourcesDto, 
      @Request() req) {
        const course = await this.coursesService.getCourse(id);
        if (!course) {
            throw new Error('Course not found');
        }
        const user = req.user as User;

        if(course.teacherId == user.id){
        fs.writeFile('uploads/' + file.originalname, file.buffer, (err) => {
            if (err) {
                console.error('Error saving file:', err);
            } else {
                console.log('File saved successfully');
            }
        });
        return this.coursesService.addRessourcesToCourse(courseRessources, id);
      } else {
        throw new Error('You are not the teacher of this course');
      }
    }

    @Student()
    @HttpCode(200)
    @Post('courses/:id/enroll')
    async enrollStudentToCourse(@Param('id') courseId: string, @Request() req) {
        const user = req.user as User;
        return this.coursesService.enrollStudentToCourse(user.id, courseId);
    }

    @Student()
    @HttpCode(200)
    @Post('courses/:id/unenroll')
    async unenrollStudentToCourse(@Param('id') courseId: string, @Request() req) {
        const user = req.user as User;
        return this.coursesService.unenrollStudentToCourse(user.id, courseId);
    }
}