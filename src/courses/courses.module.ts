import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Chapters } from './entities/chapter.entity';
import { Video } from './entities/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Chapters, Video])],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
