const { uploadImage, uploadVideo, deleteResource, getResourceDetails, getOptimizedImageUrl, getVideoThumbnail } = require('../service/cloudinary');
const response = require('../responsecode/response');
const fs = require('fs');
const path = require('path');

// ==================== UPLOAD IMAGE ====================
// POST /api/v1/media/upload-image
exports.uploadImageController = async (req, res) => {
    try {
        if (!req.file) {
            return response.validationErrorResponse(res, 'No image file provided');
        }

        const { folder } = req.body; // Optional custom folder
        const filePath = req.file.path;

        // Upload to Cloudinary
        const result = await uploadImage(filePath, folder);

        return response.successResponse(res, 'Image uploaded successfully', result.data);

    } catch (error) {
        console.error('Upload Image Error:', error);
        return response.errorResponse(res, error.message || 'Failed to upload image');
    }
};

// ==================== UPLOAD VIDEO ====================
// POST /api/v1/media/upload-video
exports.uploadVideoController = async (req, res) => {
    try {
        if (!req.file) {
            return response.validationErrorResponse(res, 'No video file provided');
        }

        const { folder } = req.body; // Optional custom folder
        const filePath = req.file.path;

        // Upload to Cloudinary
        const result = await uploadVideo(filePath, folder);

        // Generate thumbnail
        const thumbnail = getVideoThumbnail(result.data.public_id, 2); // Thumbnail at 2 seconds

        return response.successResponse(res, 'Video uploaded successfully', {
            ...result.data,
            thumbnail
        });

    } catch (error) {
        console.error('Upload Video Error:', error);
        return response.errorResponse(res, error.message || 'Failed to upload video');
    }
};

// ==================== UPLOAD MULTIPLE IMAGES ====================
// POST /api/v1/media/upload-multiple-images
exports.uploadMultipleImagesController = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return response.validationErrorResponse(res, 'No image files provided');
        }

        const { folder } = req.body; // Optional custom folder
        const uploadPromises = req.files.map(file => uploadImage(file.path, folder));

        // Upload all images concurrently
        const results = await Promise.all(uploadPromises);

        const uploadedImages = results.map(result => result.data);

        return response.successResponse(res, `${uploadedImages.length} images uploaded successfully`, uploadedImages);

    } catch (error) {
        console.error('Upload Multiple Images Error:', error);
        return response.errorResponse(res, error.message || 'Failed to upload images');
    }
};

// ==================== DELETE MEDIA ====================
// DELETE /api/v1/media/delete/:publicId
exports.deleteMediaController = async (req, res) => {
    try {
        const { publicId } = req.params;
        const { resourceType } = req.query; // 'image' or 'video'

        if (!publicId) {
            return response.validationErrorResponse(res, 'Public ID is required');
        }

        // Decode public ID (in case it's URL encoded)
        const decodedPublicId = decodeURIComponent(publicId);

        const result = await deleteResource(decodedPublicId, resourceType || 'image');

        if (result.success) {
            return response.successResponse(res, 'Media deleted successfully');
        } else {
            return response.errorResponse(res, 'Failed to delete media');
        }

    } catch (error) {
        console.error('Delete Media Error:', error);
        return response.errorResponse(res, error.message || 'Failed to delete media');
    }
};

// ==================== GET MEDIA DETAILS ====================
// GET /api/v1/media/details/:publicId
exports.getMediaDetailsController = async (req, res) => {
    try {
        const { publicId } = req.params;
        const { resourceType } = req.query; // 'image' or 'video'

        if (!publicId) {
            return response.validationErrorResponse(res, 'Public ID is required');
        }

        // Decode public ID
        const decodedPublicId = decodeURIComponent(publicId);

        const result = await getResourceDetails(decodedPublicId, resourceType || 'image');

        return response.successResponse(res, 'Media details retrieved successfully', result.data);

    } catch (error) {
        console.error('Get Media Details Error:', error);
        return response.errorResponse(res, error.message || 'Failed to get media details');
    }
};

// ==================== GET OPTIMIZED IMAGE URL ====================
// POST /api/v1/media/optimized-url
exports.getOptimizedUrlController = async (req, res) => {
    try {
        const { publicId, width, height, crop, quality } = req.body;

        if (!publicId) {
            return response.validationErrorResponse(res, 'Public ID is required');
        }

        const transformations = {};
        if (width) transformations.width = width;
        if (height) transformations.height = height;
        if (crop) transformations.crop = crop; // 'fill', 'fit', 'scale', 'crop', 'thumb', etc.
        if (quality) transformations.quality = quality;

        const optimizedUrl = getOptimizedImageUrl(publicId, transformations);

        return response.successResponse(res, 'Optimized URL generated successfully', { url: optimizedUrl });

    } catch (error) {
        console.error('Get Optimized URL Error:', error);
        return response.errorResponse(res, error.message || 'Failed to generate optimized URL');
    }
};

// ==================== GET VIDEO THUMBNAIL ====================
// POST /api/v1/media/video-thumbnail
exports.getVideoThumbnailController = async (req, res) => {
    try {
        const { publicId, time } = req.body;

        if (!publicId) {
            return response.validationErrorResponse(res, 'Public ID is required');
        }

        const thumbnailTime = time || 2; // Default to 2 seconds
        const thumbnailUrl = getVideoThumbnail(publicId, thumbnailTime);

        return response.successResponse(res, 'Video thumbnail URL generated successfully', { 
            thumbnail: thumbnailUrl,
            time: thumbnailTime 
        });

    } catch (error) {
        console.error('Get Video Thumbnail Error:', error);
        return response.errorResponse(res, error.message || 'Failed to generate video thumbnail');
    }
};
