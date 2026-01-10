import { Module } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { PrismaService } from 'src/database/prisma.service';
import { CoursesModule } from 'src/courses/courses.module';

@Module({  
    imports: [CoursesModule],
  providers: [ResourcesService, PrismaService],
  controllers: [ResourcesController]})
export class ResourcesModule {}
