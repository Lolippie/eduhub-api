import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { GenerateQuizDto } from "./dto/quiz.dto";
import { Quiz } from "generated/prisma";

@Injectable()
export class QuizzesService {
    constructor(private prismaService: PrismaService) {}

    // async generateQuiz(generateQuizDto: GenerateQuizDto): Promise<Quiz> {
        
    //     const {courseId, numberOfQuestions} = generateQuizDto;



    //     const course = await this.prismaService.course.findUnique({
    //         where: {id: courseId},
    //         include: {ressources: true}
    //     });
    // }
}