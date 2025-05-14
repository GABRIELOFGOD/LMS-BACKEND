import { IsNumber, IsString } from "class-validator";

export class CreateChapterDto {
  @IsString()
  name: string;

  @IsNumber()
  courseId: string;
}
