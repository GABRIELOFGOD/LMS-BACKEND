import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Video } from './entities/video.entity';
import { CloudinaryService } from 'src/core/config/cloudinary.config';
import { Category } from 'src/categories/entities/category.entity';
import { Attachment } from './entities/attachment.entity';
import { Chapters } from 'src/chapters/entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Chapters, Video, Category, Attachment])],
  controllers: [CoursesController],
  providers: [CoursesService, CloudinaryService],
})
export class CoursesModule {}
