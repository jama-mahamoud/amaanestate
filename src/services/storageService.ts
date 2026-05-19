import { uploadToCloudinary } from './cloudinaryUpload';
import imageCompression from 'browser-image-compression';

export interface UploadProgress {
  progress: number;
  fileName: string;
  url?: string;
  error?: string;
}

export interface ListingImage {
  id: string;
  url: string;
  path: string;
  isPrimary: boolean;
  uploadedAt: string;
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: false,
};

export const storageService = {
  /**
   * Compresses an image file before upload
   */
  async compressImage(file: File): Promise<File> {
    console.log(`Attempting compression for: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    try {
      if (file.size < 200 * 1024) {
        console.log(`Small file detected, skipping compression: ${file.name}`);
        return file;
      }
      
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
      console.log(`Compression successful for: ${file.name}. New size: ${(compressed.size / 1024).toFixed(2)} KB`);
      return compressed;
    } catch (error) {
      console.warn(`Compression skipped for ${file.name} due to error:`, error);
      return file;
    }
  },

  /**
   * Uploads multiple images for a listing using Cloudinary
   */
  async uploadListingImages(
    listingId: string, 
    files: File[], 
    onProgress?: (progress: Record<string, number>) => void
  ): Promise<ListingImage[]> {
    const progressMap: Record<string, number> = {};
    console.log(`[ListingUpload] Initializing Cloudinary migration for ${files.length} assets to listing ${listingId}`);
    
    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`[ListingUpload] Process ${index + 1}: Compressing ${file.name}`);
        const compressedFile = await this.compressImage(file);
        
        const fileKey = `${file.name}-${index}`;
        progressMap[fileKey] = 0;

        const response = await uploadToCloudinary(compressedFile, (progressValue) => {
          progressMap[fileKey] = progressValue;
          if (onProgress) {
            onProgress({ ...progressMap });
          }
        });

        console.log(`[ListingUpload] Cloudinary success: ${file.name} -> ${response.secure_url}`);
        
        return {
          id: response.public_id,
          url: response.secure_url,
          path: response.public_id,
          isPrimary: index === 0,
          uploadedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.error(`[ListingUpload] Cloudinary failure for ${file.name}:`, err);
        throw err;
      }
    });

    return Promise.all(uploadPromises);
  },

  /**
   * Deletes an image from storage (Note: Cloudinary client-side deletion requires signature)
   * We will log this for now as unsigned uploads don't support simple client-side deletion.
   */
  async deleteImage(path: string): Promise<void> {
    console.warn(`Cloudinary client-side deletion for ${path} ignored. Requires signed API request.`);
  },

  /**
   * Uploads a professional's profile/portfolio images using Cloudinary
   */
  async uploadProfessionalAssets(
    profileId: string,
    files: File[],
    onProgress?: (progress: Record<string, number>) => void
  ): Promise<ListingImage[]> {
    const progressMap: Record<string, number> = {};
    console.log(`Starting Cloudinary professional asset upload for ${profileId} with ${files.length} files`);

    const uploadPromises = files.map(async (file, index) => {
      try {
        const compressedFile = await this.compressImage(file);
        const fileKey = `${file.name}-${index}`;
        progressMap[fileKey] = 0;

        const response = await uploadToCloudinary(compressedFile, (progressValue) => {
          progressMap[fileKey] = progressValue;
          if (onProgress) {
            onProgress({ ...progressMap });
          }
        });

        return {
          id: response.public_id,
          url: response.secure_url,
          path: response.public_id,
          isPrimary: index === 0,
          uploadedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.error(`Cloudinary professional upload failure for ${file.name}:`, err);
        throw err;
      }
    });

    return Promise.all(uploadPromises);
  }
};
