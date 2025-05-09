import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto, UpdateCourseImageDto, UpdateOtherCourseDto } from './dto/update-course.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'src/core/validators/file.validator';
import { UploadService } from 'src/core/utils';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(+id, updateCourseDto);
  }

  
  
  @Put('upload/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileAndValidate(@Param('id') id: string, @Body()
  file: Express.Multer.File,) {
    const uploadedImage = await this.uploadService.uploadImage(file);
    return this.coursesService.updateCourseImage(+id, uploadedImage.secure_url);
  }

  @Put(':id')
  updateOthers(@Param('id') id: string, @Body() updateOtherCourseDto: UpdateOtherCourseDto) {
    return this.coursesService.updateOtherPartOfCourse(+id, updateOtherCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }
}
