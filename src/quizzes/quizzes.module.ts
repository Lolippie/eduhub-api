import { Module} from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { PrismaService } from 'src/database/prisma.service';
import { MistralService } from './llm/mistral.service';
import { ResourcesModule } from 'src/resources/resources.module';
import { CoursesModule } from 'src/courses/courses.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ResourcesModule, CoursesModule, AuthModule],
  controllers: [QuizzesController],
  providers: [QuizzesService, MistralService, PrismaService],
})
export class QuizzesModule {}
