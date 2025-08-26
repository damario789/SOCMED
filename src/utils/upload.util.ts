import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

// Configure Cloudinary using the environment variable
// This will automatically parse the CLOUDINARY_URL variable
cloudinary.config({
  // If CLOUDINARY_URL is set, this will automatically use it
  // Otherwise it will fall back to individual credential variables
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage on Cloudinary
interface CloudinaryStorageParams {
    folder: string;
    allowed_formats: string[];
    transformation: Array<{ width: number; crop: string }>;
    public_id: (req: Express.Request, file: Express.Multer.File) => string;
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'socmed', // Images will be stored in a folder called 'socmed'
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 1000, crop: 'limit' }, // Resize large images to max width 1000px
        ],
        public_id: (req: Express.Request, file: Express.Multer.File): string => {
            // Generate a unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = file.fieldname + '-' + uniqueSuffix;
            return path.parse(filename).name; // Use without extension
        },
    } as CloudinaryStorageParams,
});

// Filter for image files only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Export multer instance
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  }
});

// Helper to delete an image from Cloudinary
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

// Helper to extract public_id from Cloudinary URL
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    if (!url.includes('cloudinary.com')) return null;
    
    // Extract the public_id from URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/socmed/public_id.ext
    const match = url.match(/\/v\d+\/(.+?)\.[\w]+$/);
    if (match && match[1]) {
      return match[1]; // This will return "socmed/image-name"
    }
    return null;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};
