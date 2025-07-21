import { IsOptional, IsString } from "class-validator";

export class CreateChapterDto {
  @IsString()
  name: string;

  @IsString()
  courseId: string;

}

export class UploadVideoDto {
  @IsOptional()
  video: any;
}