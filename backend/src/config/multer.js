// config/multerConfig.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage for different types of uploads
const storageTypes = {
  // Profile pictures storage
  profilePictures: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './uploads/profile-pictures';
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `profile-${uniqueSuffix}${ext}`);
    }
  }),

  // Course thumbnails storage
  courseThumbnails: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './uploads/course-thumbnails';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `course-${uniqueSuffix}${ext}`);
    }
  }),

  // Course videos storage
  courseVideos: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './uploads/course-videos';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `video-${uniqueSuffix}${ext}`);
    }
  })
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
  }
};

// File filter for videos
const videoFileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (MP4, MPEG, MOV, AVI)'), false);
  }
};

// Create upload instances
const uploads = {
  // Profile picture upload (max 5MB)
  profilePicture: multer({
    storage: storageTypes.profilePictures,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }),

  // Course thumbnail upload (max 2MB)
  courseThumbnail: multer({
    storage: storageTypes.courseThumbnails,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB
    }
  }),

  // Course video upload (max 500MB)
  courseVideo: multer({
    storage: storageTypes.courseVideos,
    fileFilter: videoFileFilter,
    limits: {
      fileSize: 500 * 1024 * 1024 // 500MB
    }
  })
};

// Helper function to get file URL
const getFileUrl = (file, type = 'profilePicture') => {
  if (!file) return null;
  
  const pathMappings = {
    profilePicture: '/uploads/profile-pictures',
    courseThumbnail: '/uploads/course-thumbnails',
    courseVideo: '/uploads/course-videos'
  };
  
  return `${pathMappings[type]}/${file.filename}`;
};

// Error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Please upload a smaller file.' 
      });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

export {
  uploads,
  getFileUrl,
  handleMulterError
};