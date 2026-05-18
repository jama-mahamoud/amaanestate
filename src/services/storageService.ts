import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '../lib/firebase';
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
  useWebWorker: true,
};

export const storageService = {
  /**
   * Compresses an image file before upload
   */
  async compressImage(file: File): Promise<File> {
    try {
      return await imageCompression(file, COMPRESSION_OPTIONS);
    } catch (error) {
      console.error('Compression failed:', error);
      return file; // Fallback to original
    }
  },

  /**
   * Uploads multiple images for a listing
   */
  async uploadListingImages(
    listingId: string, 
    files: File[], 
    onProgress?: (progress: Record<string, number>) => void
  ): Promise<ListingImage[]> {
    const progressMap: Record<string, number> = {};
    
    const uploadPromises = files.map(async (file, index) => {
      const compressedFile = await this.compressImage(file);
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const path = `listings/${listingId}/${timestamp}_${safeName}`;
      const storageRef = ref(storage, path);
      
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      return new Promise<ListingImage>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progressValue = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressMap[file.name] = progressValue;
            if (onProgress) {
              // Create a copy to trigger state updates in React
              onProgress({ ...progressMap });
            }
          },
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              id: `${timestamp}_${index}`,
              url,
              path,
              isPrimary: index === 0,
              uploadedAt: new Date().toISOString(),
            });
          }
        );
      });
    });

    return Promise.all(uploadPromises);
  },

  /**
   * Deletes an image from storage
   */
  async deleteImage(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    try {
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  },

  /**
   * Uploads a professional's profile/portfolio images
   */
  async uploadProfessionalAssets(
    profileId: string,
    files: File[]
  ): Promise<ListingImage[]> {
    const uploadPromises = files.map(async (file, index) => {
      const compressedFile = await this.compressImage(file);
      const path = `professionals/${profileId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      
      await uploadBytesResumable(storageRef, compressedFile);
      const url = await getDownloadURL(storageRef);
      
      return {
        id: `${profileId}_${index}`,
        url,
        path,
        isPrimary: index === 0,
        uploadedAt: new Date().toISOString(),
      };
    });

    return Promise.all(uploadPromises);
  }
};
