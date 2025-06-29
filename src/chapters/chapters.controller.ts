// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { ChaptersService } from './chapters.service';
// import { CreateChapterDto } from './dto/create-chapter.dto';
// import { UpdateChapterDto } from './dto/update-chapter.dto';

// @Controller('chapters')
// export class ChaptersController {
//   constructor(private readonly chaptersService: ChaptersService) {}

//   @Post()
//   create(@Body() createChapterDto: CreateChapterDto) {
//     return this.chaptersService.create(createChapterDto);
//   }

//   @Get()
//   findAll() {
//     return this.chaptersService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.chaptersService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateChapterDto: UpdateChapterDto) {
//     return this.chaptersService.update(+id, updateChapterDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.chaptersService.remove(+id);
//   }
// }

import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, UploadedFile, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role/roles.guard';
import { Roles } from 'src/core/decoratoros/roles.decorator';
import { UserRole } from 'src/types/user';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chaptersService.create(createChapterDto);
  }

  @Get()
  findAll() {
    return this.chaptersService.findAll();
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.chaptersService.findByCourse(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChapterDto: UpdateChapterDto) {
    return this.chaptersService.update(id, updateChapterDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Put(':id/video')
  @UseInterceptors(FileInterceptor('video', {
    storage: diskStorage({
      filename: (_, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
  }))
  uploadVideo(
    @Param('id') id: string,
    @UploadedFile() videoFile: Express.Multer.File
  ) {
    return this.chaptersService.uploadVideo(id, videoFile);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.chaptersService.publishChapter(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.chaptersService.unpublishChapter(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Put('course/:courseId/reorder')
  reorder(
    @Param('courseId') courseId: string,
    @Body('chapterIds') chapterIds: string[]
  ) {
    return this.chaptersService.reorderChapters(courseId, chapterIds);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chaptersService.remove(id);
  }
}