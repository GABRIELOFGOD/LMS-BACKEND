import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly dataSource: DataSource,
  ){}
  
  async create(createCourseDto: CreateCourseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const courseExists = await this.courseRepository.findOne({
        where: {title: createCourseDto.title}
      });

      if (courseExists) throw new ConflictException("Course title exists, can you please pick another title. Thanh you");
      
      const course = this.courseRepository.create(createCourseDto);
      await queryRunner.manager.save(course);

      await queryRunner.commitTransaction();
      return course;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    try {
      return this.courseRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const course = await this.courseRepository.findOne({
        where: {id}
      });

      if (!course) throw new NotFoundException("Course not found");

      return course;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      const course = await this.courseRepository.findOne({
        where: {id}
      });

      if (!course) throw new NotFoundException("Course not found");

      const updatedCourse = await this.courseRepository.update(course.id, updateCourseDto);

      return { message: "Course updated successfully", updatedCourse }
    } catch (error) {
      throw error
    }
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
