import { ConfigService } from "@nestjs/config";

const configService: ConfigService = new ConfigService();

export const CLOUDINARY_CLOUD_NAME = configService.get<string>('CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_API_KEY = configService.get<string>('CLOUDINARY_API_KEY');
export const CLOUDINARY_API_SECRET = configService.get<string>('CLOUDINARY_API_SECRET');
export const CLOUDINARY_UPLOAD_PRESET = configService.get<string>('CLOUDINARY_UPLOAD_PRESET');
