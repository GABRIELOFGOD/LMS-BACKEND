import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapters } from './entities/chapter.entity';
import { Course } from 'src/courses/entities/course.entity';
import { CoursesService } from 'src/courses/courses.service';
import { Attachment } from 'src/courses/entities/attachment.entity';
import { CloudinaryService } from 'src/config/cloudinary.config';

@Module({
  imports: [TypeOrmModule.forFeature([Chapters, Course, Attachment])],
  controllers: [ChaptersController],
  providers: [ChaptersService, CoursesService, CloudinaryService],
})
export class ChaptersModule {}
