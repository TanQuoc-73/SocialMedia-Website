const PostService = require('../services/postService');

const postController = {
    // GET /posts - Lấy tất cả bài viết với pagination
    getAllPosts: async (req, res, next) => {
        try {
            const { page, limit } = req.query;
            const result = await PostService.getAllPosts(page, limit);

            res.json({
                success: true,
                data: result.posts,
                pagination: result.pagination
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /posts/:id - Lấy bài viết theo ID
    getPostById: async (req, res, next) => {
        try {
            const post = await PostService.getPostById(req.params.id);

            res.json({
                success: true,
                data: post
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /posts/user/:userId - Lấy bài viết của một user
    getUserPosts: async (req, res, next) => {
        try {
            const { page, limit } = req.query;
            const result = await PostService.getUserPosts(req.params.userId, page, limit);

            res.json({
                success: true,
                posts: result.posts,
                pagination: result.pagination
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /posts - Tạo bài viết mới
    createPost: async (req, res, next) => {
        try {
            // Tự động lấy author từ authenticated user
            const postData = {
                ...req.body,
                author: req.userId
            };

            const newPost = await PostService.createPost(postData);

            res.status(201).json({
                success: true,
                message: 'Tạo bài viết thành công',
                data: newPost
            });
        } catch (err) {
            next(err);
        }
    },

    // PUT /posts/:id - Cập nhật bài viết
    updatePost: async (req, res, next) => {
        try {
            const updatedPost = await PostService.updatePost(req.params.id, req.body);

            res.json({
                success: true,
                message: 'Cập nhật bài viết thành công',
                data: updatedPost
            });
        } catch (err) {
            next(err);
        }
    },

    // DELETE /posts/:id - Xóa bài viết
    deletePost: async (req, res, next) => {
        try {
            const result = await PostService.deletePost(req.params.id);

            res.json({
                success: true,
                ...result
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /posts/:id/like - Like/Unlike bài viết
    likePost: async (req, res, next) => {
        try {
            // Lấy userId từ authenticated user thay vì body
            const result = await PostService.toggleLike(req.params.id, req.userId);

            res.json({
                success: true,
                message: result.isLiked ? 'Đã thích bài viết' : 'Đã bỏ thích',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = postController;