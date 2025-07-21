import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapters } from './entities/chapter.entity';
import { Course } from 'src/courses/entities/course.entity';
import { CoursesService } from 'src/courses/courses.service';
import { Attachment } from 'src/courses/entities/attachment.entity';
import { CloudinaryService } from 'src/config/cloudinary.config';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chapters, Course, Attachment, User])],
  controllers: [ChaptersController],
  providers: [ChaptersService, CoursesService, CloudinaryService],
})
export class ChaptersModule {}
