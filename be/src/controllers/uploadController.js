const UploadService = require('../services/uploadService');

const uploadController = {
    // POST /upload/post-image - Upload single image for post
    uploadPostImage: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn ảnh để upload'
                });
            }

            const imageData = await UploadService.uploadImage(req.file, 'social-media/posts');

            res.json({
                success: true,
                message: 'Upload ảnh thành công',
                data: imageData
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /upload/post-images - Upload multiple images for post
    uploadPostImages: async (req, res, next) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn ít nhất 1 ảnh để upload'
                });
            }

            const imagesData = await UploadService.uploadMultipleImages(req.files, 'social-media/posts');

            res.json({
                success: true,
                message: `Upload ${imagesData.length} ảnh thành công`,
                data: imagesData
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /upload/avatar - Upload user avatar
    uploadAvatar: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn ảnh avatar'
                });
            }

            const imageData = await UploadService.uploadImage(req.file, 'social-media/avatars');

            res.json({
                success: true,
                message: 'Upload avatar thành công',
                data: imageData
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /upload/cover-photo - Upload cover photo
    uploadCoverPhoto: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn ảnh cover'
                });
            }

            const imageData = await UploadService.uploadImage(req.file, 'social-media/covers');

            res.json({
                success: true,
                message: 'Upload cover photo thành công',
                data: imageData
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /upload/video - Upload video
    uploadVideo: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn video để upload'
                });
            }

            const videoData = await UploadService.uploadImage(req.file, 'social-media/videos');

            res.json({
                success: true,
                message: 'Upload video thành công',
                data: videoData
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /upload/:publicId - Delete uploaded file
    deleteUpload: async (req, res, next) => {
        try {
            const { publicId } = req.params;
            const { type = 'image' } = req.query; // image or video

            let result;
            if (type === 'video') {
                result = await UploadService.deleteVideo(publicId);
            } else {
                result = await UploadService.deleteImage(publicId);
            }

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /upload/optimize/:publicId - Get optimized image URL
    getOptimizedUrl: async (req, res, next) => {
        try {
            const { publicId } = req.params;
            const { width, height, quality } = req.query;

            const optimizedUrl = UploadService.getOptimizedImageUrl(publicId, {
                width: parseInt(width) || 800,
                height: parseInt(height) || 800,
                quality: quality || 'auto'
            });

            res.json({
                success: true,
                data: {
                    url: optimizedUrl
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = uploadController;
