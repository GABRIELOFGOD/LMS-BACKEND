import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateChapterDto, UploadVideoDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { Repository, Not, DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ){}
  
  async create(createChapterDto: CreateChapterDto, uploadVideoDto: UploadVideoDto) {
    return await this.dataSource.transaction(async manager => {
      try {
        const course = await manager.findOne(Course, {
          where: { id: createChapterDto.courseId },
          relations: ['chapters'],
        });

        if (!course) throw new NotFoundException('Course not found');

        const chapterExists = await manager.findOne(Chapters, {
          where: { name: createChapterDto.name, course: { id: course.id } },
        });
        if (chapterExists) throw new BadRequestException('Chapter with this name already exists');

        // Get the next position for this chapter
        const maxPosition = await manager
          .createQueryBuilder(Chapters, 'chapter')
          .select('MAX(chapter.position)', 'maxPosition')
          .where('chapter.courseId = :courseId', { courseId: course.id })
          .getRawOne();

        const nextPosition = (maxPosition?.maxPosition || 0) + 1;

        const chapter = manager.create(Chapters, {
          ...createChapterDto,
          course,
          position: nextPosition,
        });

        const savedChapter = await manager.save(chapter);

        // Handle optional video upload
        let uploadedVideo = null;
        if (uploadVideoDto) {
          try {
            uploadedVideo = await this.cloudinaryService.uploadVideo(uploadVideoDto);
            
            // Update chapter with video URL
            await manager.update(Chapters, savedChapter.id, {
              video: uploadedVideo
            });

            // Refresh the chapter with video URL
            savedChapter.video = uploadedVideo;
          } catch (error) {
            throw new BadRequestException(`Video upload failed: ${error.message}`);
          }
        }

        const addChapter = new UpdateCourseDto({
          chapters: [...course.chapters, savedChapter],
        });

        // Update course with new chapter (this should also be transactional)
        await this.courseService.addCourseChapter(course.id, addChapter);

        return { message: "Chapter added successfully", chapter: savedChapter };
        
      } catch (error) {
        throw error;
      }
    });
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
    return await this.dataSource.transaction(async manager => {
      try {
        const chapter = await manager.findOne(Chapters, {
          where: { id },
          relations: ['course']
        });

        if (!chapter) throw new NotFoundException('Chapter not found');

        // Check if name already exists for another chapter in the same course
        if (updateChapterDto.name) {
          const existingChapter = await manager.findOne(Chapters, {
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

        await manager.update(Chapters, id, updateChapterDto);
        
        const updatedChapter = await manager.findOne(Chapters, {
          where: { id },
          relations: ['course']
        });

        return { message: "Chapter updated successfully", chapter: updatedChapter };
      } catch (error) {
        throw error;
      }
    });
  }

  async uploadVideo(id: string, videoFile: any) {
    return await this.dataSource.transaction(async manager => {
      try {
        const chapter = await manager.findOne(Chapters, {
          where: { id }
        });

        if (!chapter) throw new NotFoundException('Chapter not found');

        // Validate video file
        if (!videoFile) throw new BadRequestException('No video or PDF file provided');
        
        const allowedMimeTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedMimeTypes.includes(videoFile.mimetype)) {
          throw new BadRequestException('Invalid video format. Only MP4, AVI, MOV are allowed');
        }

        const maxSize = 500 * 1024 * 1024; // 500MB
        if (videoFile.size > maxSize) {
          throw new BadRequestException('Video or PDF file size must be less than 500MB');
        }

        let oldVideoToDelete = null;
        
        // Store old video URL for deletion after successful upload
        if (chapter.video) {
          oldVideoToDelete = chapter.video;
        }

        // Upload new video to Cloudinary
        let uploadedVideo;
        try {
          uploadedVideo = await this.cloudinaryService.uploadVideo(videoFile);
        } catch (error) {
          throw new BadRequestException(`Video upload failed: ${error.message}`);
        }

        // Update chapter with new video URL
        await manager.update(Chapters, id, {
          video: uploadedVideo
        });

        // Delete old video if exists (after successful database update)
        if (oldVideoToDelete) {
          try {
            await this.deleteVideo(oldVideoToDelete);
          } catch (error) {
            console.warn('Failed to delete old video:', error);
            // Don't throw here as the main operation succeeded
          }
        }

        const updatedChapter = await manager.findOne(Chapters, {
          where: { id }
        });

        return { message: "Chapter file uploaded successfully", chapter: updatedChapter };
      } catch (error) {
        throw error;
      }
    });
  }

  // async uploadVideo(id: string, file: any) {
  //   return await this.dataSource.transaction(async manager => {
  //     try {
  //       const chapter = await manager.findOne(Chapters, { where: { id } });
  //       if (!chapter) throw new NotFoundException('Chapter not found');

  //       if (!file) throw new BadRequestException('No file provided');

  //       // Allowed MIME types
  //       const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
  //       const allowedDocTypes = [
  //         'application/pdf',
  //         'application/msword',
  //         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  //       ];

  //       const isVideo = allowedVideoTypes.includes(file.mimetype);
  //       const isDoc = allowedDocTypes.includes(file.mimetype);

  //       if (!isVideo && !isDoc) {
  //         throw new BadRequestException('Invalid file format. Only MP4, AVI, MOV, PDF, DOC, DOCX are allowed');
  //       }

  //       // Size validation
  //       if (isVideo && file.size > 500 * 1024 * 1024) {
  //         throw new BadRequestException('Video file size must be less than 500MB');
  //       }
  //       if (isDoc && file.size > 20 * 1024 * 1024) {
  //         throw new BadRequestException('Document file size must be less than 20MB');
  //       }

  //       let oldFileToDelete = null;
  //       let uploadedFileUrl;

  //       if (isVideo) {
  //         // Handle video
  //         if (chapter.video) oldFileToDelete = chapter.video;

  //         try {
  //           uploadedFileUrl = await this.cloudinaryService.uploadVideo(file);
  //         } catch (error) {
  //           throw new BadRequestException(`Video upload failed: ${error.message}`);
  //         }

  //         await manager.update(Chapters, id, { video: uploadedFileUrl });

  //         if (oldFileToDelete) {
  //           try {
  //             await this.deleteVideo(oldFileToDelete);
  //           } catch (error) {
  //             console.warn('Failed to delete old video:', error);
  //           }
  //         }
  //       }

  //       if (isDoc) {
  //         // Handle PDF/DOC/DOCX
  //         if (chapter.video) oldFileToDelete = chapter.video;

  //         try {
  //           uploadedFileUrl = await this.cloudinaryService.uploadFile(file); // use normal upload
  //         } catch (error) {
  //           throw new BadRequestException(`Document upload failed: ${error.message}`);
  //         }

  //         await manager.update(Chapters, id, { video: uploadedFileUrl });

  //         if (oldFileToDelete) {
  //           try {
  //             await this.deleteFile(oldFileToDelete);
  //           } catch (error) {
  //             console.warn('Failed to delete old document:', error);
  //           }
  //         }
  //       }

  //       const updatedChapter = await manager.findOne(Chapters, { where: { id } });

  //       return { 
  //         message: `${isVideo ? "Video" : "Document"} uploaded successfully`, 
  //         chapter: updatedChapter 
  //       };
  //     } catch (error) {
  //       throw error;
  //     }
  //   });
  // }

  async publishChapter(id: string) {
    return await this.dataSource.transaction(async manager => {
      try {
        const chapter = await manager.findOne(Chapters, {
          where: { id }
        });

        if (!chapter) throw new NotFoundException('Chapter not found');

        if (!chapter.video) {
          throw new BadRequestException('Cannot publish chapter without a video');
        }

        await manager.update(Chapters, id, {
          isPublished: true
        });

        const updatedChapter = await manager.findOne(Chapters, {
          where: { id }
        });

        return { message: "Chapter published successfully", chapter: updatedChapter };
      } catch (error) {
        throw error;
      }
    });
  }

  async unpublishChapter(id: string) {
    return await this.dataSource.transaction(async manager => {
      try {
        const chapter = await manager.findOne(Chapters, {
          where: { id }
        });

        if (!chapter) throw new NotFoundException('Chapter not found');

        await manager.update(Chapters, id, {
          isPublished: false
        });

        const updatedChapter = await manager.findOne(Chapters, {
          where: { id }
        });

        return { message: "Chapter unpublished successfully", chapter: updatedChapter };
      } catch (error) {
        throw error;
      }
    });
  }

  async reorderChapters(courseId: string, chapterIds: string[]) {
    return await this.dataSource.transaction(async manager => {
      try {
        const course = await manager.findOne(Course, {
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

        // Update positions
        for (let i = 0; i < chapterIds.length; i++) {
          await manager.update(Chapters, chapterIds[i], {
            position: i + 1
          });
        }

        return { message: "Chapters reordered successfully" };
      } catch (error) {
        throw error;
      }
    });
  }

  async remove(id: string) {
    return await this.dataSource.transaction(async manager => {
      try {
        const chapter = await manager.findOne(Chapters, {
          where: { id },
          relations: ['course']
        });

        if (!chapter) throw new NotFoundException('Chapter not found');

        let videoToDelete = null;
        if (chapter.video) {
          videoToDelete = chapter.video;
        }

        // Remove chapter
        await manager.remove(chapter);

        // Reorder remaining chapters to fill the gap
        const remainingChapters = await manager.find(Chapters, {
          where: { course: { id: chapter.course.id } },
          order: { position: 'ASC' }
        });

        // Update positions
        for (let i = 0; i < remainingChapters.length; i++) {
          await manager.update(Chapters, remainingChapters[i].id, {
            position: i + 1
          });
        }

        // Delete video from Cloudinary after successful database operations
        if (videoToDelete) {
          try {
            await this.deleteVideo(videoToDelete);
          } catch (error) {
            console.warn('Failed to delete video from Cloudinary:', error);
            // Don't throw here as the main operation succeeded
          }
        }

        return { message: "Chapter deleted successfully" };
      } catch (error) {
        throw error;
      }
    });
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