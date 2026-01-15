import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
  UseGuards,
  Param,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CoursesService } from 'src/courses/courses.service';
import { Role } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseQuizDto } from './dto/response-quiz.dto';

@ApiTags('quiz')
@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly coursesService: CoursesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.TEACHER)
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Génère automatiquement un quiz pour un cours' })
  @ApiBody({ type: GenerateQuizDto, description: 'ID du cours pour lequel générer le quiz' })
  @ApiResponse({ status: 200, description: 'Quiz généré avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé au cours' })
  async generateQuiz(
    @Body() generateQuizDto: GenerateQuizDto,
    @Req() req,
  ) {
    const user = req.user;

    const course = await this.coursesService.getCourse(generateQuizDto.courseId);

    if (user.id !== course.teacher?.id) {
      throw new ForbiddenException("Vous n'avez pas accès à ce cours");
    }

    return this.quizzesService.generate(generateQuizDto.courseId);
  }


  @UseGuards(JwtAuthGuard)
  @Roles(Role.STUDENT)
  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soumettre les réponses d’un quiz et obtenir le score' })
  @ApiResponse({ status: 200, description: 'Quiz corrigé et feedback renvoyé' })
  @ApiResponse({ status: 404, description: 'Quiz introuvable' })
  @ApiResponse({ status: 400, description: 'Réponses invalides' })
  async submitQuiz(
    @Param('id') quizId: string,
    @Body() dto: ResponseQuizDto,
    @Req() req
  ) {
    const user = req.user
    const course = await this.quizzesService.getCourseByQuizId(quizId)

    await this.coursesService.getCourseByStudentIdAndCourseId(user.id, course.id)
    
    return this.quizzesService.submit(quizId, dto);
  }
}


