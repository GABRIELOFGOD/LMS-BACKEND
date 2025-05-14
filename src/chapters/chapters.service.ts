import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { Repository } from 'typeorm';
import { Chapters } from './entities/chapter.entity';
import { CoursesService } from 'src/courses/courses.service';
import { UpdateCourseDto } from 'src/courses/dto/update-course.dto';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Chapters)
    private readonly chapterRepository: Repository<Chapters>,
    private readonly courseService: CoursesService,
  ){}
  
  async create(createChapterDto: CreateChapterDto) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id: Number(createChapterDto.courseId) },
        relations: ['chapters', 'chapters.videos'],
      });

      if (!course) throw new NotFoundException('Course not found');

      const chapterExists = await this.chapterRepository.findOne({
        where: { name: createChapterDto.name, course: { id: course.id } },
      });
      if (chapterExists) throw new NotFoundException('Chapter already exists');

      const chapter = this.chapterRepository.create({
        ...createChapterDto,
        course,
      });

      const addChapter = new UpdateCourseDto({
        chapters: [...course.chapters, chapter],
      })

      await this.courseService.addCourseChapter(course.id, addChapter);
      await this.chapterRepository.save(chapter);

      return { message: "Chapter added successfully", chapter }
      
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all chapters`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chapter`;
  }

  update(id: number, updateChapterDto: UpdateChapterDto) {
    return `This action updates a #${id} chapter`;
  }

  remove(id: number) {
    return `This action removes a #${id} chapter`;
  }
}
