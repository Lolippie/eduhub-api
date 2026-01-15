import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { MistralService } from './llm/mistral.service';
import { generateQuizPrompt } from './prompts/generate-quiz.prompt';
import { QuizSchema } from './schemas/quiz.schema';
import { correctQuiz } from './utils/quiz-corrector';
import { PrismaService } from 'src/database/prisma.service';
import { ResourcesService } from 'src/resources/resources.service';
import { parseLLMJson } from './llm/parseLLMJson';
import { ResponseQuizDto } from './dto/response-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: MistralService,
    private readonly resourceService: ResourcesService,
  ) {}

  async generate(courseId: string) {
    const resources = await this.resourceService.getResourcesByCourse(courseId);
    const content = await Promise.all(
      resources.map(r => this.resourceService.readResourceContent(r, courseId))
    );

    const prompt = generateQuizPrompt(content.join('\n'));

    let raw: string;
    try {
      raw = await this.llm.generate(prompt);
    } catch (err) {
      console.error('Erreur LLM:', err);
      throw new BadRequestException('Impossible de générer le quiz via LLM');
    }

    let quizData;
    try {
      quizData = QuizSchema.parse(parseLLMJson(raw));
    } catch (err) {
      console.error('Erreur de parsing JSON:', err);
      throw new BadRequestException('Le JSON généré par le LLM est invalide');
    }

    const quiz = await this.prisma.quiz.create({
      data: {
        courseId,
        questions: {
          create: quizData.questions.map(q => ({
            label: q.label,
            answers: { create: q.answers },
          })),
        },
      },
      include: { questions: { include: { answers: true } } },
    });

    return quiz;
  }

  async submit(quizId: string, dto: ResponseQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { answers: true } } },
    });

    if (!quiz) throw new NotFoundException('Quiz introuvable');

    const quizAnswerIds = quiz.questions.flatMap(q => q.answers.map(a => a.id));
    if (!quizAnswerIds) throw new UnauthorizedException("there is no answers to this question")
    for (const ans of dto.answers.flatMap(a => a.answerIds)) {
      if (!quizAnswerIds.includes(ans)) {
        throw new BadRequestException(`Réponse invalide fournie: ${ans}`);
      }
    }

    return correctQuiz(quiz, dto);
  }

  async getCourseByQuizId(quizId: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        quiz: {
          id: quizId, // Filtre sur le quiz associé
        },
      },
      select:{
        id: true
      }
    });

    if (!course) {
      throw new NotFoundException(`Cours pour le quiz introuvable`);
    }

    return course;
  }
}
