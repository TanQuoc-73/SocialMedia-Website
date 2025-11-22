const Post = require('../models/Post');

class PostService {
    // Lấy tất cả posts với pagination
    static async getAllPosts(page = 1, limit = 10) {
        try {
            const posts = await Post.getPaginatedPosts(parseInt(page), parseInt(limit));
            const total = await Post.countDocuments();

            return {
                posts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching posts: ${error.message}`);
        }
    }

    // Lấy post theo ID
    static async getPostById(postId) {
        try {
            const post = await Post.findById(postId)
                .populate('author', 'username profile.avatar profile.firstName profile.lastName')
                .populate({
                    path: 'likes',
                    select: 'username profile.avatar'
                });

            if (!post) {
                throw new Error('Post không tồn tại');
            }

            return post;
        } catch (error) {
            throw new Error(`Error fetching post: ${error.message}`);
        }
    }

    // Tạo post mới
    static async createPost(postData) {
        try {
            const { author, content, media, privacy, tags } = postData;

            if (!author || !content) {
                throw new Error('Author và content là bắt buộc');
            }

            const newPost = new Post({
                author,
                content,
                media,
                privacy,
                tags
            });

            await newPost.save();
            await newPost.populate('author', 'username profile.avatar');

            return newPost;
        } catch (error) {
            throw new Error(`Error creating post: ${error.message}`);
        }
    }

    // Cập nhật post
    static async updatePost(postId, updateData) {
        try {
            const { content, media, privacy, tags } = updateData;

            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { content, media, privacy, tags },
                { new: true, runValidators: true }
            ).populate('author', 'username profile.avatar');

            if (!updatedPost) {
                throw new Error('Post không tồn tại');
            }

            return updatedPost;
        } catch (error) {
            throw new Error(`Error updating post: ${error.message}`);
        }
    }

    // Xóa post
    static async deletePost(postId) {
        try {
            const deletedPost = await Post.findByIdAndDelete(postId);

            if (!deletedPost) {
                throw new Error('Post không tồn tại');
            }

            return { message: 'Xóa post thành công' };
        } catch (error) {
            throw new Error(`Error deleting post: ${error.message}`);
        }
    }

    // Like/Unlike post
    static async toggleLike(postId, userId) {
        try {
            const post = await Post.findById(postId);

            if (!post) {
                throw new Error('Post không tồn tại');
            }

            const likeIndex = post.likes.indexOf(userId);

            if (likeIndex > -1) {
                // Unlike
                post.likes.splice(likeIndex, 1);
            } else {
                // Like
                post.likes.push(userId);
            }

            await post.save();

            // Return full post object with populated author
            await post.populate('author', 'username profile.avatar');
            return post;
        } catch (error) {
            throw new Error(`Error toggling like: ${error.message}`);
        }
    }

    // Lấy posts của một user
    static async getUserPosts(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;

            const posts = await Post.find({ author: userId })
                .populate('author', 'username profile.avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Post.countDocuments({ author: userId });

            return {
                posts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching user posts: ${error.message}`);
        }
    }

    // Tìm kiếm posts
    static async searchPosts(query, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const searchRegex = new RegExp(query, 'i');

            const posts = await Post.find({
                $or: [
                    { content: searchRegex },
                    { tags: searchRegex }
                ]
            })
                .populate('author', 'username profile.avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Post.countDocuments({
                $or: [
                    { content: searchRegex },
                    { tags: searchRegex }
                ]
            });

            return {
                posts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error searching posts: ${error.message}`);
        }
    }
}

module.exports = PostService;