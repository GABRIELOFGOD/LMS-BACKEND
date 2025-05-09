
const uploadImage = async (file: Express.Multer.File) => {
  return await cloudinary.uploader.upload(file.path);
}
// cloudinary.provider.ts
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class cloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: ""
    });
  }
}; 
