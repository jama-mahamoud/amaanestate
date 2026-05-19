import { uploadToCloudinary } from './cloudinaryUpload';

export const uploadFile = async (
  file: File, 
  _path: string, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    console.log('Starting Cloudinary broadcast for asset:', file.name);
    const response = await uploadToCloudinary(file, onProgress);
    console.log('Cloudinary broadcast successful:', response.secure_url);
    return response.secure_url;
  } catch (error) {
    console.error('Cloudinary broadcast failure:', error);
    throw error;
  }
};
