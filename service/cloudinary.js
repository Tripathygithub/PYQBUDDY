const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Local file path
 * @param {String} folder - Cloudinary folder name (optional)
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = async (filePath, folder = 'pyqbuddy/images', options = {}) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'image',
            transformation: [
                { width: 1920, height: 1080, crop: 'limit' }, // Max dimensions
                { quality: 'auto' }, // Auto quality optimization
                { fetch_format: 'auto' } // Auto format (WebP for supported browsers)
            ],
            ...options
        });

        // Delete local file after upload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return {
            success: true,
            data: {
                public_id: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.bytes,
                created_at: result.created_at
            }
        };
    } catch (error) {
        // Delete local file on error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

/**
 * Upload video to Cloudinary
 * @param {String} filePath - Local file path
 * @param {String} folder - Cloudinary folder name (optional)
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadVideo = async (filePath, folder = 'pyqbuddy/videos', options = {}) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'video',
            transformation: [
                { width: 1920, height: 1080, crop: 'limit' }, // Max dimensions
                { quality: 'auto' }, // Auto quality optimization
                { fetch_format: 'auto' } // Auto format
            ],
            eager: [
                { width: 640, height: 360, crop: 'pad', format: 'mp4' }, // Mobile version
                { width: 1280, height: 720, crop: 'pad', format: 'mp4' } // Desktop version
            ],
            eager_async: true,
            ...options
        });

        // Delete local file after upload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return {
            success: true,
            data: {
                public_id: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                duration: result.duration,
                size: result.bytes,
                created_at: result.created_at,
                playback_url: result.playback_url || result.secure_url
            }
        };
    } catch (error) {
        // Delete local file on error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

/**
 * Delete resource from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} Delete result
 */
const deleteResource = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        return {
            success: result.result === 'ok',
            message: result.result === 'ok' ? 'Resource deleted successfully' : 'Resource not found'
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get resource details from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} Resource details
 */
const getResourceDetails = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: resourceType
        });

        return {
            success: true,
            data: result
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get optimized image URL with transformations
 * @param {String} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {String} Optimized URL
 */
const getOptimizedImageUrl = (publicId, transformations = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' },
            ...Object.entries(transformations).map(([key, value]) => ({ [key]: value }))
        ]
    });
};

/**
 * Get video thumbnail URL
 * @param {String} publicId - Cloudinary public ID
 * @param {Number} time - Time in seconds for thumbnail
 * @returns {String} Thumbnail URL
 */
const getVideoThumbnail = (publicId, time = 0) => {
    return cloudinary.url(publicId, {
        resource_type: 'video',
        secure: true,
        transformation: [
            { start_offset: time, duration: 1 },
            { width: 640, height: 360, crop: 'fill' },
            { quality: 'auto' },
            { format: 'jpg' }
        ]
    });
};

module.exports = {
    cloudinary,
    uploadImage,
    uploadVideo,
    deleteResource,
    getResourceDetails,
    getOptimizedImageUrl,
    getVideoThumbnail
};
