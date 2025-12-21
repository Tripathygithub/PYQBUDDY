const express = require('express');
const router = express.Router();
const mediaController = require('../../controllers/mediaController');
const { uploadImage, uploadVideo, uploadMultipleImages } = require('../../service/mediaUpload');
const { authenticate, isAdmin } = require('../../service/middleware');
const { uploadLimiter } = require('../../service/rateLimiter');

// ==================== IMAGE UPLOAD ====================
// POST /api/v1/media/upload-image
router.post(
    '/upload-image',
    authenticate,
    uploadLimiter,
    uploadImage.single('image'),
    mediaController.uploadImageController
);

// ==================== VIDEO UPLOAD ====================
// POST /api/v1/media/upload-video
router.post(
    '/upload-video',
    authenticate,
    uploadLimiter,
    uploadVideo.single('video'),
    mediaController.uploadVideoController
);

// ==================== MULTIPLE IMAGES UPLOAD ====================
// POST /api/v1/media/upload-multiple-images
router.post(
    '/upload-multiple-images',
    authenticate,
    uploadLimiter,
    uploadMultipleImages.array('images', 10), // Max 10 images
    mediaController.uploadMultipleImagesController
);

// ==================== DELETE MEDIA ====================
// DELETE /api/v1/media/delete/:publicId?resourceType=image
router.delete(
    '/delete/:publicId',
    authenticate,
    isAdmin,
    mediaController.deleteMediaController
);

// ==================== GET MEDIA DETAILS ====================
// GET /api/v1/media/details/:publicId?resourceType=image
router.get(
    '/details/:publicId',
    authenticate,
    mediaController.getMediaDetailsController
);

// ==================== GET OPTIMIZED IMAGE URL ====================
// POST /api/v1/media/optimized-url
// Body: { publicId, width, height, crop, quality }
router.post(
    '/optimized-url',
    mediaController.getOptimizedUrlController
);

// ==================== GET VIDEO THUMBNAIL ====================
// POST /api/v1/media/video-thumbnail
// Body: { publicId, time }
router.post(
    '/video-thumbnail',
    mediaController.getVideoThumbnailController
);

module.exports = router;
