// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateChapterDto } from './dto/create-chapter.dto';
// import { UpdateChapterDto } from './dto/update-chapter.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Course } from 'src/courses/entities/course.entity';
// import { Repository } from 'typeorm';
// import { Chapters } from './entities/chapter.entity';
// import { CoursesService } from 'src/courses/courses.service';
// import { UpdateCourseDto } from 'src/courses/dto/update-course.dto';

// @Injectable()
// export class ChaptersService {
//   constructor(
//     @InjectRepository(Course)
//     private readonly courseRepository: Repository<Course>,

//     @InjectRepository(Chapters)
//     private readonly chapterRepository: Repository<Chapters>,
//     private readonly courseService: CoursesService,
//   ){}
  
//   async create(createChapterDto: CreateChapterDto) {
//     try {
//       const course = await this.courseRepository.findOne({
//         where: { id: createChapterDto.courseId },
//         relations: ['chapters', 'chapters.videos'],
//       });

//       if (!course) throw new NotFoundException('Course not found');

//       const chapterExists = await this.chapterRepository.findOne({
//         where: { name: createChapterDto.name, course: { id: course.id } },
//       });
//       if (chapterExists) throw new NotFoundException('Chapter already exists');

//       const chapter = this.chapterRepository.create({
//         ...createChapterDto,
//         course,
//       });

//       const addChapter = new UpdateCourseDto({
//         chapters: [...course.chapters, chapter],
//       })

//       await this.courseService.addCourseChapter(course.id, addChapter);
//       await this.chapterRepository.save(chapter);

//       return { message: "Chapter added successfully", chapter }
      
//     } catch (error) {
//       throw error;
//     }
//   }

//   findAll() {
//     return `This action returns all chapters`;
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} chapter`;
//   }

//   update(id: number, updateChapterDto: UpdateChapterDto) {
//     return `This action updates a #${id} chapter`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} chapter`;
//   }
// }


import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { Repository, Not } from 'typeorm';
import { Chapters } from './entities/chapter.entity';
import { CoursesService } from 'src/courses/courses.service';
import { UpdateCourseDto } from 'src/courses/dto/update-course.dto';
import { CloudinaryService } from 'src/config/cloudinary.config';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Chapters)
    private readonly chapterRepository: Repository<Chapters>,
    
    private readonly courseService: CoursesService,
    private readonly cloudinaryService: CloudinaryService,
  ){}
  
  async create(createChapterDto: CreateChapterDto) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id: createChapterDto.courseId },
        relations: ['chapters'],
      });

      if (!course) throw new NotFoundException('Course not found');

      const chapterExists = await this.chapterRepository.findOne({
        where: { name: createChapterDto.name, course: { id: course.id } },
      });
      if (chapterExists) throw new BadRequestException('Chapter with this name already exists');

      // Get the next position for this chapter
      const maxPosition = await this.chapterRepository
        .createQueryBuilder('chapter')
        .select('MAX(chapter.position)', 'maxPosition')
        .where('chapter.courseId = :courseId', { courseId: course.id })
        .getRawOne();

      const nextPosition = (maxPosition?.maxPosition || 0) + 1;

      const chapter = this.chapterRepository.create({
        ...createChapterDto,
        course,
        position: nextPosition,
      });

      const savedChapter = await this.chapterRepository.save(chapter);

      const addChapter = new UpdateCourseDto({
        chapters: [...course.chapters, savedChapter],
      });

      await this.courseService.addCourseChapter(course.id, addChapter);

      return { message: "Chapter added successfully", chapter: savedChapter };
      
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const chapters = await this.chapterRepository.find({
        relations: ['course'],
        order: { position: 'ASC' }
      });
      
      return chapters;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const chapter = await this.chapterRepository.findOne({
        where: { id },
        relations: ['course']
      });

      if (!chapter) throw new NotFoundException('Chapter not found');

      return chapter;
    } catch (error) {
      throw error;
    }
  }

  async findByCourse(courseId: string) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id: courseId }
      });

      if (!course) throw new NotFoundException('Course not found');

      const chapters = await this.chapterRepository.find({
        where: { course: { id: courseId } },
        order: { position: 'ASC' }
      });

      return chapters;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateChapterDto: UpdateChapterDto) {
    try {
      const chapter = await this.chapterRepository.findOne({
        where: { id },
        relations: ['course']
      });

      if (!chapter) throw new NotFoundException('Chapter not found');

      // Check if name already exists for another chapter in the same course
      if (updateChapterDto.name) {
        const existingChapter = await this.chapterRepository.findOne({
          where: { 
            name: updateChapterDto.name, 
            course: { id: chapter.course.id },
            id: Not(id) // Exclude current chapter
          },
        });

        if (existingChapter) {
          throw new BadRequestException('Chapter with this name already exists');
        }
      }

      await this.chapterRepository.update(id, updateChapterDto);
      
      const updatedChapter = await this.chapterRepository.findOne({
        where: { id },
        relations: ['course']
      });

      return { message: "Chapter updated successfully", chapter: updatedChapter };
    } catch (error) {
      throw error;
    }
  }

  async uploadVideo(id: string, videoFile: any) {
    try {
      const chapter = await this.chapterRepository.findOne({
        where: { id }
      });

      if (!chapter) throw new NotFoundException('Chapter not found');

      // Validate video file
      if (!videoFile) throw new BadRequestException('No video file provided');
      
      const allowedMimeTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
      if (!allowedMimeTypes.includes(videoFile.mimetype)) {
        throw new BadRequestException('Invalid video format. Only MP4, AVI, MOV are allowed');
      }

      const maxSize = 500 * 1024 * 1024; // 500MB
      if (videoFile.size > maxSize) {
        throw new BadRequestException('Video file size must be less than 500MB');
      }

      // Delete old video if exists
      if (chapter.video) {
        try {
          await this.deleteVideo(chapter.video);
        } catch (error) {
          console.warn('Failed to delete old video:', error);
        }
      }

      // Upload new video to Cloudinary
      const uploadedVideo = await this.cloudinaryService.uploadVideo(videoFile);

      // Update chapter with new video URL
      await this.chapterRepository.update(id, {
        video: uploadedVideo
      });

      const updatedChapter = await this.chapterRepository.findOne({
        where: { id }
      });

      return { message: "Video uploaded successfully", chapter: updatedChapter };
    } catch (error) {
      throw error;
    }
  }

  async publishChapter(id: string) {
    try {
      const chapter = await this.chapterRepository.findOne({
        where: { id }
      });

      if (!chapter) throw new NotFoundException('Chapter not found');

      if (!chapter.video) {
        throw new BadRequestException('Cannot publish chapter without a video');
      }

      await this.chapterRepository.update(id, {
        isPublished: true
      });

      const updatedChapter = await this.chapterRepository.findOne({
        where: { id }
      });

      return { message: "Chapter published successfully", chapter: updatedChapter };
    } catch (error) {
      throw error;
    }
  }

  async unpublishChapter(id: string) {
    try {
      const chapter = await this.chapterRepository.findOne({
        where: { id }
      });

      if (!chapter) throw new NotFoundException('Chapter not found');

      await this.chapterRepository.update(id, {
        isPublished: false
      });

      const updatedChapter = await this.chapterRepository.findOne({
        where: { id }
      });

      return { message: "Chapter unpublished successfully", chapter: updatedChapter };
    } catch (error) {
      throw error;
    }
  }

  async reorderChapters(courseId: string, chapterIds: string[]) {
    try {
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
        relations: ['chapters']
      });

      if (!course) throw new NotFoundException('Course not found');

      // Validate that all chapter IDs belong to this course
      const courseChapterIds = course.chapters.map(ch => ch.id);
      const invalidIds = chapterIds.filter(id => !courseChapterIds.includes(id));
      
      if (invalidIds.length > 0) {
        throw new BadRequestException('Some chapters do not belong to this course');
      }

      if (chapterIds.length !== courseChapterIds.length) {
        throw new BadRequestException('All chapters must be included in reorder');
      }

      // Update positions using a transaction
      await this.chapterRepository.manager.transaction(async manager => {
        for (let i = 0; i < chapterIds.length; i++) {
          await manager.update(Chapters, chapterIds[i], {
            position: i + 1
          });
        }
      });

      return { message: "Chapters reordered successfully" };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const chapter = await this.chapterRepository.findOne({
        where: { id },
        relations: ['course']
      });

      if (!chapter) throw new NotFoundException('Chapter not found');

      // Delete video from Cloudinary if exists
      if (chapter.video) {
        try {
          await this.deleteVideo(chapter.video);
        } catch (error) {
          console.warn('Failed to delete video from Cloudinary:', error);
        }
      }

      // Remove chapter
      await this.chapterRepository.remove(chapter);

      // Reorder remaining chapters to fill the gap
      const remainingChapters = await this.chapterRepository.find({
        where: { course: { id: chapter.course.id } },
        order: { position: 'ASC' }
      });

      // Update positions
      await this.chapterRepository.manager.transaction(async manager => {
        for (let i = 0; i < remainingChapters.length; i++) {
          await manager.update(Chapters, remainingChapters[i].id, {
            position: i + 1
          });
        }
      });

      return { message: "Chapter deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  private async deleteVideo(videoUrl: string) {
    try {
      // Extract public ID from Cloudinary URL
      const publicId = this.extractPublicIdFromUrl(videoUrl);
      if (publicId) {
        await this.cloudinaryService.deleteVideo(publicId);
      }
    } catch (error) {
      throw error;
    }
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      // Extract public ID from Cloudinary URL
      // Example: https://res.cloudinary.com/demo/video/upload/v1312461204/lms/sample.mp4
      const parts = url.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
        // Remove file extension
        return publicIdWithExtension.replace(/\.[^/.]+$/, '');
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}