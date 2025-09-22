import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          // Callback function
          if (error) return reject(error);
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Cloudinary upload failed: No result returned.'));
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string) {
    return await cloudinary.uploader.destroy(publicId);
  }

  extractPublicId(url: string): string | null {
    if (!url) return null;
    // contoh url: https://res.cloudinary.com/demo/image/upload/v1234567890/items/abc123.jpg
    const parts = url.split('/');
    const filename = parts[parts.length - 1]; // abc123.jpg
    const publicId = filename.split('.')[0]; // abc123
    const folder = parts[parts.length - 2]; // items (optional kalau ada folder)
    return `${folder}/${publicId}`;
  }
}
