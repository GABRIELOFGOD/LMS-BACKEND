import { Module } from "@nestjs/common";
import { CloudinaryService } from "./cloudinary.config";

@Module({
  imports: [],
  providers: [CloudinaryService],
})

export class CloudinaryModule {}