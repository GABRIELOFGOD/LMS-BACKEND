import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto, UpdateCourseImageDto, UpdateOtherCourseDto } from './dto/update-course.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
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
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      filename: (_, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
  }))
  async uploadFileAndValidate(
    @Param('id') id: string,
    @UploadedFile() updateCourseImageDto: UpdateCourseImageDto
  ) {
    return this.coursesService.updateCourseImage(+id, updateCourseImageDto);
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
