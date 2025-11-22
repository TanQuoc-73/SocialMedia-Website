const cloudinary = require('../config/cloudinary');

class UploadService {
    // Upload single image
    static async uploadImage(file, folder = 'social-media/general') {
        try {
            if (!file) {
                throw new Error('Không có file để upload');
            }

            return {
                url: file.path,
                publicId: file.filename,
                format: file.format,
                width: file.width,
                height: file.height,
                size: file.bytes
            };
        } catch (error) {
            throw new Error(`Lỗi upload ảnh: ${error.message}`);
        }
    }

    // Upload multiple images
    static async uploadMultipleImages(files, folder = 'social-media/general') {
        try {
            if (!files || files.length === 0) {
                throw new Error('Không có file để upload');
            }

            return files.map(file => ({
                url: file.path,
                publicId: file.filename,
                format: file.format,
                width: file.width,
                height: file.height,
                size: file.bytes
            }));
        } catch (error) {
            throw new Error(`Lỗi upload ảnh: ${error.message}`);
        }
    }

    // Delete image from Cloudinary
    static async deleteImage(publicId) {
        try {
            if (!publicId) {
                throw new Error('Public ID là bắt buộc');
            }

            const result = await cloudinary.uploader.destroy(publicId);

            if (result.result !== 'ok') {
                throw new Error('Không thể xóa ảnh');
            }

            return { message: 'Xóa ảnh thành công' };
        } catch (error) {
            throw new Error(`Lỗi xóa ảnh: ${error.message}`);
        }
    }

    // Delete video from Cloudinary
    static async deleteVideo(publicId) {
        try {
            if (!publicId) {
                throw new Error('Public ID là bắt buộc');
            }

            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: 'video'
            });

            if (result.result !== 'ok') {
                throw new Error('Không thể xóa video');
            }

            return { message: 'Xóa video thành công' };
        } catch (error) {
            throw new Error(`Lỗi xóa video: ${error.message}`);
        }
    }

    // Get optimized image URL
    static getOptimizedImageUrl(publicId, options = {}) {
        const {
            width = 800,
            height = 800,
            crop = 'limit',
            quality = 'auto',
            format = 'auto'
        } = options;

        return cloudinary.url(publicId, {
            transformation: [
                { width, height, crop },
                { quality, fetch_format: format }
            ]
        });
    }

    // Get thumbnail URL
    static getThumbnailUrl(publicId, size = 200) {
        return cloudinary.url(publicId, {
            transformation: [
                { width: size, height: size, crop: 'fill' },
                { quality: 'auto', fetch_format: 'auto' }
            ]
        });
    }

    // Generate responsive image URLs
    static getResponsiveImageUrls(publicId) {
        const sizes = [320, 640, 1024, 1920];

        return sizes.map(size => ({
            width: size,
            url: cloudinary.url(publicId, {
                transformation: [
                    { width: size, crop: 'scale' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            })
        }));
    }

    // Upload from URL
    static async uploadFromUrl(url, folder = 'social-media/general') {
        try {
            const result = await cloudinary.uploader.upload(url, {
                folder: folder
            });

            return {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                size: result.bytes
            };
        } catch (error) {
            throw new Error(`Lỗi upload từ URL: ${error.message}`);
        }
    }
}

module.exports = UploadService;
