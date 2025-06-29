import { IsString } from "class-validator";

export class CreateChapterDto {
  @IsString()
  name: string;

  @IsString()
  courseId: string;
}
