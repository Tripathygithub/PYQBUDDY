const multer = require('multer');
const path = require('path');

// Use memory storage for cloud platforms (Render, Heroku, etc.)
// Files are stored in memory as Buffer instead of disk
const memoryStorage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed.'), false);
    }
};

// File filter for videos
const videoFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4, MPEG, MOV, AVI, and WebM videos are allowed.'), false);
    }
};

// Multer upload middleware for images
const uploadImage = multer({
    storage: memoryStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for images
    }
});

// Multer upload middleware for videos
const uploadVideo = multer({
    storage: memoryStorage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit for videos
    }
});

// Multer upload middleware for multiple images
const uploadMultipleImages = multer({
    storage: memoryStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10 // Max 10 files
    }
});

module.exports = {
    uploadImage,
    uploadVideo,
    uploadMultipleImages
};
