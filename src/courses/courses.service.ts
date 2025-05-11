import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseCategoryDto, UpdateCourseDto, UpdateCourseImageDto, UpdateOtherCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { DataSource, Repository } from 'typeorm';
import { CloudinaryService } from 'src/core/config/cloudinary.config';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
    private readonly cloudinarySe: CloudinaryService
  ){}
  
  async create(createCourseDto: CreateCourseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const courseExists = await this.courseRepository.findOne({
        where: {title: createCourseDto.title}
      });

      if (courseExists) throw new ConflictException("Course title exists, can you please pick another title. Thank you");
      
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
        where: {id},
        relations: ["category"]
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

  async updateOtherPartOfCourse(id: number, updateOtherCourseDto: UpdateOtherCourseDto) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id }
      });

      if (!course) throw new NotFoundException("Course not found, please refresh");

      await this.courseRepository.update(course.id, updateOtherCourseDto);

      return { message: "Course updated successfully" }
    } catch (error) {
      throw error;
    }
  }

  async updateCourseImage(id: number, updateCourseImageDto: UpdateCourseImageDto) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id }
      });

      if (!course) throw new NotFoundException("Course not found, please refresh");

      const uploadedImage = await this.cloudinarySe.uploadImage(updateCourseImageDto);

      const newCourse = await this.courseRepository.update(course.id, {
        imageUrl: uploadedImage
      });

      console.log("new Course with image", newCourse);
      return { message: "Course image updated successfully." }
    } catch (error) {
      throw error;
    }
  }

  async addCategory(id: number, updateCourseDto: UpdateCourseCategoryDto) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id }
      });

      if (!course) throw new NotFoundException("Course not found, please refresh");

      const category = await this.categoryRepository.findOne({
        where: { name: updateCourseDto.category }
      });

      if (!category) throw new NotFoundException("Category not found, please refresh");

      await this.courseRepository.update(course.id, {
        category
      });

      return { message: "Course category updated successfully" }
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id }
      });

      if (!course) throw new NotFoundException("Course not found, please refresh");

      await this.courseRepository.delete(course.id);

      return { message: "Course deleted successfully" }
    } catch (error) {
      throw error;
    }
  }
}
