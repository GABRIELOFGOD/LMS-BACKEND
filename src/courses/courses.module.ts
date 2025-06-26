import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CloudinaryService } from 'src/config/cloudinary.config';
import { Attachment } from './entities/attachment.entity';
import { Chapters } from 'src/chapters/entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Chapters, Attachment])],
  controllers: [CoursesController],
  providers: [CoursesService, CloudinaryService],
})
export class CoursesModule {}
