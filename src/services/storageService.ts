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
    console.log(`Attempting compression for: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    try {
      // If file is already small, skip compression
      if (file.size < 200 * 1024) {
        console.log(`Small file detected, skipping compression: ${file.name}`);
        return file;
      }
      
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
      console.log(`Compression successful for: ${file.name}. New size: ${(compressed.size / 1024).toFixed(2)} KB`);
      return compressed;
    } catch (error) {
      console.warn(`Compression skipped for ${file.name} due to error:`, error);
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
    console.log(`[ListingUpload] Phase 1: Initializing upload for ${files.length} assets to listing ${listingId}`);
    
    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`[ListingUpload] Process ${index + 1}: Starting ${file.name}`);
        const compressedFile = await this.compressImage(file);
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const path = `listings/${listingId}/${timestamp}_${safeName}`;
        const storageRef = ref(storage, path);
        
        console.log(`[ListingUpload] Process ${index + 1}: Dispatching to Firebase Storage -> ${path}`);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        return new Promise<ListingImage>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progressValue = snapshot.totalBytes > 0 
                ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
                : 0;
              
              const fileKey = `${file.name}-${index}`;
              progressMap[fileKey] = progressValue;
              
              console.log(`[ListingUpload] File ${index + 1} Progress: ${progressValue.toFixed(1)}%`);
              
              if (onProgress) {
                onProgress({ ...progressMap });
              }
            },
            (error) => {
              console.error(`[ListingUpload] Critical Failure for ${file.name}:`, error);
              reject(error);
            },
            async () => {
              try {
                console.log(`[ListingUpload] File ${index + 1} finalized. Fetching access URL...`);
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                console.log(`[ListingUpload] Success: ${file.name} -> ${url}`);
                resolve({
                  id: `${timestamp}_${index}`,
                  url,
                  path,
                  isPrimary: index === 0,
                  uploadedAt: new Date().toISOString(),
                });
              } catch (urlError) {
                console.error(`[ListingUpload] URL Resolution Error for ${file.name}:`, urlError);
                reject(urlError);
              }
            }
          );
        });
      } catch (err) {
        console.error(`[ListingUpload] Pre-flight logic failed for ${file.name}:`, err);
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
    files: File[],
    onProgress?: (progress: Record<string, number>) => void
  ): Promise<ListingImage[]> {
    const progressMap: Record<string, number> = {};
    console.log(`Starting professional asset upload for ${profileId} with ${files.length} files`);

    const uploadPromises = files.map(async (file, index) => {
      try {
        const compressedFile = await this.compressImage(file);
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const path = `professionals/${profileId}/${timestamp}_${safeName}`;
        const storageRef = ref(storage, path);
        
        console.log(`Uploading professional file ${index + 1}/${files.length}: ${path}`);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        return new Promise<ListingImage>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progressValue = snapshot.totalBytes > 0 
                ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
                : 0;
              
              const fileKey = `${file.name}-${index}`;
              progressMap[fileKey] = progressValue;
              
              if (onProgress) {
                onProgress({ ...progressMap });
              }
            },
            (error) => {
              console.error(`Professional upload failed for ${file.name}:`, error);
              reject(error);
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                console.log(`Professional upload successful for ${file.name}: ${url}`);
                resolve({
                  id: `${profileId}_${timestamp}_${index}`,
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
        console.error(`Pre-upload processing failed for professional asset ${file.name}:`, err);
        throw err;
      }
    });

    return Promise.all(uploadPromises);
  }
};
