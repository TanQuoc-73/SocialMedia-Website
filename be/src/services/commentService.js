const Comment = require('../models/Comment');
const Post = require('../models/Post');

class CommentService {
    // Lấy comments của một post
    static async getCommentsByPost(postId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;

            const comments = await Comment.find({
                post: postId,
                parentComment: null
            })
                .populate('author', 'username profile.avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Comment.countDocuments({
                post: postId,
                parentComment: null
            });

            return {
                comments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching comments: ${error.message}`);
        }
    }

    // Lấy replies của một comment
    static async getReplies(commentId) {
        try {
            const replies = await Comment.getReplies(commentId);
            return replies;
        } catch (error) {
            throw new Error(`Error fetching replies: ${error.message}`);
        }
    }

    // Tạo comment mới
    static async createComment(commentData) {
        try {
            const { post, author, content, media, parentComment } = commentData;

            const comment = new Comment({
                post,
                author,
                content,
                media,
                parentComment
            });

            await comment.save();
            await comment.populate('author', 'username profile.avatar');

            // Cập nhật commentsCount của post
            await Post.findByIdAndUpdate(post, {
                $inc: { commentsCount: 1 }
            });

            return comment;
        } catch (error) {
            throw new Error(`Error creating comment: ${error.message}`);
        }
    }

    // Cập nhật comment
    static async updateComment(commentId, updateData) {
        try {
            const { content, media } = updateData;

            const comment = await Comment.findByIdAndUpdate(
                commentId,
                { content, media, isEdited: true },
                { new: true, runValidators: true }
            ).populate('author', 'username profile.avatar');

            if (!comment) {
                throw new Error('Comment không tồn tại');
            }

            return comment;
        } catch (error) {
            throw new Error(`Error updating comment: ${error.message}`);
        }
    }

    // Xóa comment
    static async deleteComment(commentId) {
        try {
            const comment = await Comment.findByIdAndDelete(commentId);

            if (!comment) {
                throw new Error('Comment không tồn tại');
            }

            // Giảm commentsCount của post
            await Post.findByIdAndUpdate(comment.post, {
                $inc: { commentsCount: -1 }
            });

            return { message: 'Xóa comment thành công' };
        } catch (error) {
            throw new Error(`Error deleting comment: ${error.message}`);
        }
    }

    // Like/Unlike comment
    static async toggleLike(commentId, userId) {
        try {
            const comment = await Comment.findById(commentId);

            if (!comment) {
                throw new Error('Comment không tồn tại');
            }

            const likeIndex = comment.likes.indexOf(userId);

            if (likeIndex > -1) {
                comment.likes.splice(likeIndex, 1);
            } else {
                comment.likes.push(userId);
            }

            await comment.save();

            return {
                likesCount: comment.likesCount,
                isLiked: likeIndex === -1
            };
        } catch (error) {
            throw new Error(`Error toggling like: ${error.message}`);
        }
    }
}

module.exports = CommentService;
