import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = 'di3ry2idk';
const CLOUDINARY_UPLOAD_PRESET = 'amaanestate_upload';

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
}

/**
 * Uploads a file directly to Cloudinary using unsigned upload preset
 * @param file The file to upload
 * @param onProgress Callback for upload progress
 * @returns Promise with Cloudinary response
 */
export const uploadToCloudinary = async (
  file: File | Blob,
  onProgress?: (progress: number) => void
): Promise<CloudinaryResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Cloudinary upload failure:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
      throw new Error(`Cloudinary Error: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    throw error;
  }
};

/**
 * Uploads multiple files to Cloudinary
 */
export const uploadMultipleToCloudinary = async (
  files: (File | Blob)[],
  onOverallProgress?: (progress: number) => void
): Promise<CloudinaryResponse[]> => {
  const totalFiles = files.length;
  const individualProgress = new Array(totalFiles).fill(0);

  const updateOverallProgress = () => {
    if (onOverallProgress) {
      const sum = individualProgress.reduce((a, b) => a + b, 0);
      onOverallProgress(Math.round(sum / totalFiles));
    }
  };

  const uploadPromises = files.map((file, index) =>
    uploadToCloudinary(file, (p) => {
      individualProgress[index] = p;
      updateOverallProgress();
    })
  );

  return Promise.all(uploadPromises);
};
