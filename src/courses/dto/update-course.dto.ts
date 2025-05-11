import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

export class UpdateOtherCourseDto {
  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  price: number;
}

export class UpdateCourseCategoryDto {
  @IsString()
  @IsNotEmpty()
  category: string;
}

export class UpdateCourseImageDto {
  @IsNotEmpty()
  file: any;
}
