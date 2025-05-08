import { BadRequestException } from "@nestjs/common";
import cloudinary from "./config/cloudinary";
import { CLOUDINARY_UPLOAD_PRESET } from "./config/env";

export const imageUpload = async (file: any) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(file, {
      public_id: CLOUDINARY_UPLOAD_PRESET
    });

    if (!uploadResult.secure_url) throw new BadRequestException("Image upload failed");
    if (uploadResult.secure_url) return uploadResult.secure_url;
  } catch (error) {
    throw error;
  }
}