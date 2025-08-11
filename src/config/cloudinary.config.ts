// // cloudinary.provider.ts
// import { v2 as cloudinary } from 'cloudinary';

// // @Injectable()
// export class CloudinaryService {
//   constructor() {
//     cloudinary.config({
//       cloud_name: "dybxh4bqw",
//       api_key: "839928822467662",
//       api_secret: "QpLlieZ6qqMBDeum3zkWXYhYdQE",
//     });
//   }

//   async uploadImage(file: any) {
//     const result = await cloudinary.uploader.upload(
//       file.path,
//       { folder: "lms" }
//     );

//     if (!result.secure_url) throw new Error("Image upload failed");
//     return result.secure_url;
//   }
//   async deleteImage(publicId: string) {
//     return new Promise((resolve, reject) => {
//       cloudinary.uploader.destroy(publicId, (error, result) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       });
//     });
//   }
// }; 

import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: "dybxh4bqw",
      api_key: "839928822467662",
      api_secret: "QpLlieZ6qqMBDeum3zkWXYhYdQE",
    });
  }

  async uploadImage(file: any) {
    const result = await cloudinary.uploader.upload(
      file.path,
      { folder: "lms" }
    );

    if (!result.secure_url) throw new Error("Image upload failed");
    return result.secure_url;
  }

  async uploadVideo(file: any) {
    const result = await cloudinary.uploader.upload(
      file.path,
      { 
        folder: "lms/videos",
        resource_type: "video",
        chunk_size: 10000000, // 10MB chunks for large files
        eager: [
          { 
            quality: "auto", 
            fetch_format: "auto" 
          }
        ]
      }
    );

    if (!result.secure_url) throw new Error("Video upload failed");
    return result.secure_url;
  }

  async deleteImage(publicId: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  async deleteVideo(publicId: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { 
        resource_type: "video" 
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}
