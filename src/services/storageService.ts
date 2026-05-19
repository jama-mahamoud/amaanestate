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
  useWebWorker: false, // Changed to false for better compatibility in sandboxed environments
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
    console.log(`Starting upload of ${files.length} images for listing ${listingId}`);
    
    const uploadPromises = files.map(async (file, index) => {
      try {
        const compressedFile = await this.compressImage(file);
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const path = `listings/${listingId}/${timestamp}_${safeName}`;
        const storageRef = ref(storage, path);
        
        console.log(`Uploading file ${index + 1}/${files.length}: ${path}`);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        return new Promise<ListingImage>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progressValue = snapshot.totalBytes > 0 
                ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
                : 0;
              
              // Use a unique key for each file to handle duplicate names
              const fileKey = `${file.name}-${index}`;
              progressMap[fileKey] = progressValue;
              
              if (onProgress) {
                onProgress({ ...progressMap });
              }
            },
            (error) => {
              console.error(`Upload failed for ${file.name}:`, error);
              reject(error);
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                console.log(`Upload successful for ${file.name}: ${url}`);
                resolve({
                  id: `${timestamp}_${index}`,
                  url,
                  path,
                  isPrimary: index === 0,
                  uploadedAt: new Date().toISOString(),
                });
              } catch (urlError) {
                console.error(`Failed to get download URL for ${file.name}:`, urlError);
                reject(urlError);
              }
            }
          );
        });
      } catch (err) {
        console.error(`Pre-upload processing failed for ${file.name}:`, err);
        throw err;
      }
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
