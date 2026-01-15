import { Module, forwardRef } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { PrismaService } from 'src/database/prisma.service';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
    imports: [forwardRef(() => CoursesModule)],
  providers: [ResourcesService, PrismaService],
  controllers: [ResourcesController],
  exports: [ResourcesService],
})
export class ResourcesModule {}
