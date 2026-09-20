import multer from 'multer';

// Use memory storage to stream directly to Cloudinary
const storage = multer.memoryStorage();

// File filter for validation
const fileFilter = (req, file, cb) => {
  // Allow images for profile photos (e.g. fieldname 'photo')
  // Allow images + pdf for prescriptions (e.g. fieldname 'prescription')
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (file.fieldname === 'prescription') {
    allowedMimeTypes.push('application/pdf');
  }

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
  }
};

// Configured multer instance: max 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
