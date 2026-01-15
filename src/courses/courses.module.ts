import { Module, forwardRef } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaService } from 'src/database/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { ResourcesModule } from 'src/resources/resources.module';

@Module({
  imports: [UsersModule, forwardRef(() => ResourcesModule)],
  providers: [CoursesService, PrismaService],
  controllers: [CoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
