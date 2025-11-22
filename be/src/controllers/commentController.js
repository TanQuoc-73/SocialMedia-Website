const CommentService = require('../services/commentService');

const commentController = {
    // GET /comments?postId=xxx
    getCommentsByPost: async (req, res, next) => {
        try {
            const { postId, page, limit } = req.query;

            if (!postId) {
                return res.status(400).json({
                    success: false,
                    message: 'postId là bắt buộc'
                });
            }

            const result = await CommentService.getCommentsByPost(postId, page, limit);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /comments/:id/replies
    getReplies: async (req, res, next) => {
        try {
            const replies = await CommentService.getReplies(req.params.id);

            res.json({
                success: true,
                data: replies
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /comments
    createComment: async (req, res, next) => {
        try {
            const { postId, content, parentComment } = req.body;

            // Get author from authenticated user
            const author = req.userId;

            const comment = await CommentService.createComment({
                post: postId,
                author,
                content,
                parentComment
            });

            res.status(201).json({
                success: true,
                message: 'Tạo comment thành công',
                data: comment
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /comments/:id
    updateComment: async (req, res, next) => {
        try {
            const comment = await CommentService.updateComment(req.params.id, req.body);

            res.json({
                success: true,
                message: 'Cập nhật comment thành công',
                data: comment
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /comments/:id
    deleteComment: async (req, res, next) => {
        try {
            const result = await CommentService.deleteComment(req.params.id);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /comments/:id/like
    toggleLike: async (req, res, next) => {
        try {
            const userId = req.userId; // Get from auth middleware
            const result = await CommentService.toggleLike(req.params.id, userId);

            res.json({
                success: true,
                message: result.isLiked ? 'Đã thích comment' : 'Đã bỏ thích',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = commentController;
