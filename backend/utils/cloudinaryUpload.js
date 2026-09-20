import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {String} folder - The Cloudinary folder to upload to
 * @returns {Promise<String>} - The secure URL of the uploaded file
 */
export const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    
    // Write buffer to stream
    uploadStream.end(fileBuffer);
  });
};
