const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
    uploadPostImage,
    uploadPostImages,
    uploadAvatar,
    uploadCoverPhoto,
    uploadVideo,
    handleUploadError
} = require('../middleware/upload');

// All upload routes require authentication and rate limiting
router.use(authenticate);
router.use(uploadLimiter);

// POST /upload/post-image - Upload single image for post
router.post('/post-image',
    authenticate,
    uploadPostImage,
    handleUploadError,
    uploadController.uploadPostImage
);

// POST /upload/post-images - Upload multiple images for post
router.post('/post-images',
    authenticate,
    uploadPostImages,
    handleUploadError,
    uploadController.uploadPostImages
);

// POST /upload/avatar - Upload user avatar
router.post('/avatar',
    authenticate,
    uploadAvatar,
    handleUploadError,
    uploadController.uploadAvatar
);

// POST /upload/cover-photo - Upload cover photo
router.post('/cover-photo',
    authenticate,
    uploadCoverPhoto,
    handleUploadError,
    uploadController.uploadCoverPhoto
);

// POST /upload/video - Upload video
router.post('/video',
    authenticate,
    uploadVideo,
    handleUploadError,
    uploadController.uploadVideo
);

// DELETE /upload/:publicId - Delete uploaded file
router.delete('/:publicId',
    authenticate,
    uploadController.deleteUpload
);

// GET /upload/optimize/:publicId - Get optimized image URL
router.get('/optimize/:publicId',
    uploadController.getOptimizedUrl
);

module.exports = router;
