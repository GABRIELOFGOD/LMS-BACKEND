// upload.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { v2 as CloudinaryType } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof CloudinaryType) {}

  async uploadImage(file: Express.Multer.File) {
    return await this.cloudinary.uploader.upload(file.path);
  }
}
