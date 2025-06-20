import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseCategoryDto, UpdateCourseDto, UpdateCourseImageDto, UpdateOtherCourseDto } from './dto/update-course.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role/roles.guard';
import { Roles } from 'src/core/decoratoros/roles.decorator';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "teacher")
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

  @Put('add-category/:id')
  addCategory(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseCategoryDto) {
    return this.coursesService.addCategory(+id, updateCourseDto);
  }
  
  @Put('upload/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      filename: (_, file, cb) => {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
  }))
  uploadFileAndValidate(
    @Param('id') id: string,
    @UploadedFile() updateCourseImageDto: UpdateCourseImageDto
  ) {
    return this.coursesService.updateCourseImage(+id, updateCourseImageDto);
  }

  @Put('attachments/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      filename: (_, file, cb) => {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
  }))
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() updateCourseImageDto: UpdateCourseImageDto
  ) {
    return this.coursesService.updateCourseAttachment(+id, updateCourseImageDto);
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
