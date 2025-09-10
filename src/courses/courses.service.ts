import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto, UpdateCourseImageDto, UpdateOtherCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CloudinaryService } from 'src/config/cloudinary.config';
import { Attachment } from './entities/attachment.entity';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/types/user';
import { Enrollment } from './entities/enrollments.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    private readonly dataSource: DataSource,
    private readonly cloudinarySe: CloudinaryService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
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

  async findAll() {
    try {
      return await this.courseRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async findAllPublished() {
    try {
      return await this.courseRepository.find({
        where: { publish: true },
        relations: ["chapters"]
      });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const course = await this.courseRepository.findOne({
        where: {id},
        relations: ["attachments", "chapters"]
      });

      if (!course) throw new NotFoundException("Course not found");

      return course;
    } catch (error) {
      throw error;
    }
  }

  async addCourseChapter(id: string, updateCourseDto: UpdateCourseDto) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id }
      });

      if (!course) throw new NotFoundException("Course not found, please refresh");

      await this.courseRepository.update(course.id, updateCourseDto);

      return { message: "Course updated successfully" }
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    try {
      const course = await this.courseRepository.findOne({
        where: {id}
      });

      if (!course) throw new NotFoundException("Course not found");

      await this.courseRepository.update(course.id, updateCourseDto);

      return { message: "Course updated successfully" }
    } catch (error) {
      throw error
    }
  }

  async updateOtherPartOfCourse(id: string, updateOtherCourseDto: UpdateOtherCourseDto) {
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

  async updateCourseImage(id: string, updateCourseImageDto: UpdateCourseImageDto) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id }
      });

      if (!course) throw new NotFoundException("Course not found, please refresh");

      const uploadedImage = await this.cloudinarySe.uploadImage(updateCourseImageDto);

      await this.courseRepository.update(course.id, {
        imageUrl: uploadedImage
      });

      return { message: "Course image updated successfully." }
    } catch (error) {
      throw error;
    }
  }

  async attachmentUpload(
    file: any,
    course: Course,
    queryRunner: QueryRunner
  ) {
    try {
      const uploadedImage = await this.cloudinarySe.uploadImage(file);
  
      const attachment = this.attachmentRepository.create({
        url: uploadedImage,
        course,
        originalName: file.originalname
      });
  
      // Save via queryRunner's manager to respect the transaction
      return await queryRunner.manager.save(attachment);
    } catch (error) {
      throw new InternalServerErrorException("Failed to upload and save attachment.", error);
    }
  }
  
  async updateCourseAttachment(id: string, updateCourseImageDto: UpdateCourseImageDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const course = await queryRunner.manager.findOne(Course, {
        where: { id },
        relations: ["attachments"]
      });
  
      if (!course) {
        throw new NotFoundException("Course not found, please refresh.");
      }

      const courseAttachment = await this.attachmentUpload(updateCourseImageDto, course, queryRunner);
  
      // Safeguard against undefined attachments array
      course.attachments = course.attachments ? [...course.attachments, courseAttachment] : [courseAttachment];
  
      await queryRunner.manager.save(course);
  
      await queryRunner.commitTransaction();
  
      return { message: "Course attachment updated successfully." };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log("ERROR", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async GetUserCourses(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ["enrollments"]
      });
      if (!user) return new NotFoundException("User auth failed, please login and try again");

      const enrolledCourses = user.enrollments;
      const completedCourses = [];

      return { enrolledCourses, completedCourses }
    } catch (error) {
      throw error;
    }
  }
  

  // async addCategory(id: string, updateCourseDto: UpdateCourseCategoryDto) {
  //   try {
  //     const course = await this.courseRepository.findOne({
  //       where: { id }
  //     });

  //     if (!course) throw new NotFoundException("Course not found, please refresh");

  //     const category = await this.categoryRepository.findOne({
  //       where: { name: updateCourseDto.category }
  //     });

  //     if (!category) throw new NotFoundException("Category not found, please refresh");

  //     // await this.courseRepository.update(course.id, {
  //     //   category
  //     // });

  //     return { message: "Course category updated successfully" }
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async publishCourse(id: string) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id },
        relations: ["chapters"]
      });

      if (!course) throw new NotFoundException("Course not found, please refresh");

      if (!course.publish) {
        if (!course.title) throw new BadRequestException("Course must have Title to be published");

        if (!course.description) throw new BadRequestException("Course must have Description to be published");

        if (!course.imageUrl) throw new BadRequestException("Course must have an Image to be published");
        
        const hasPublishedChapter = course.chapters.some((cht) => cht.isPublished);
        if (!hasPublishedChapter) throw new BadRequestException("You must have at least one published chapter to publish this course");
      }
      
      course.publish = !course.publish;
      await this.courseRepository.save(course);
      return {
        message: "Course publication updated successfully"
      }
    } catch (error) {
      throw error;
    }
  }

  // ================= ENROLL ========================= //
  async enrolCourse(courseId: string, userId: string) {
    try {
      // 1. Find user
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException("Please log in to enroll for a course.");
      if (user.role !== UserRole.STUDENT)
        throw new BadRequestException("Only students can enroll in courses.");

      // 2. Find course
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
      if (!course) throw new NotFoundException("Course not found, please refresh.");
      if (course.isDeleted)
        throw new BadRequestException("This course has been deleted and cannot be enrolled in.");

      // 3. Check if already enrolled
      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: {
          student: { id: userId },
          course: { id: courseId },
        },
        relations: ["student", "course"],
      });

      if (existingEnrollment)
        throw new ConflictException("You are already enrolled in this course.");

      // 4. Create new enrollment
      const enrollment = this.enrollmentRepository.create({
        student: user,
        course: course,
      });

      await this.enrollmentRepository.save(enrollment);

      return {
        message: `Congratulations ${user.fname} ${user.lname}, you have successfully enrolled in: ${course.title}`,
      };
    } catch (error) {
      throw error;
    }
  }
  // ================= ENROLL ========================= //

  async remove(id: string) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id }
      });

      if (!course) throw new NotFoundException("Course not found, please refresh");
      if (course.isDeleted) throw new BadRequestException("This course is deleted");

      // Unpublic course
      course.publish = false;

      // Change course delete status
      course.isDeleted = true;
      await this.courseRepository.save(course);

      return { message: "Course deleted successfully" }
    } catch (error) {
      throw error;
    }
  }

  async restore(id: string) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id }
      });

      if (!course) throw new NotFoundException("Course not found, please refresh");

      course.isDeleted = false;
      await this.courseRepository.save(course);

      return { message: "Course restored successfully" }
    } catch (error) {
      throw error;
    }
  }
}
