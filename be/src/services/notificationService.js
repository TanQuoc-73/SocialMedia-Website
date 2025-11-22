const Notification = require('../models/Notification');

class NotificationService {
    // Lấy notifications của user
    static async getUserNotifications(userId, page = 1, limit = 20) {
        try {
            const notifications = await Notification.getUserNotifications(
                userId,
                parseInt(page),
                parseInt(limit)
            );

            const total = await Notification.countDocuments({ recipient: userId });
            const unreadCount = await Notification.getUnreadCount(userId);

            return {
                notifications,
                unreadCount,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching notifications: ${error.message}`);
        }
    }

    // Tạo notification mới
    static async createNotification(notificationData) {
        try {
            const { recipient, sender, type, post, comment, conversation } = notificationData;

            const notification = new Notification({
                recipient,
                sender,
                type,
                post,
                comment,
                conversation
            });

            await notification.save();
            await notification.populate('sender', 'username profile.avatar');

            return notification;
        } catch (error) {
            throw new Error(`Error creating notification: ${error.message}`);
        }
    }

    // Đánh dấu notification đã đọc
    static async markAsRead(notificationId) {
        try {
            const notification = await Notification.findById(notificationId);

            if (!notification) {
                throw new Error('Notification không tồn tại');
            }

            await notification.markAsRead();

            return notification;
        } catch (error) {
            throw new Error(`Error marking as read: ${error.message}`);
        }
    }

    // Đánh dấu tất cả đã đọc
    static async markAllAsRead(userId) {
        try {
            const result = await Notification.markAllAsRead(userId);

            return {
                message: 'Đã đánh dấu tất cả đã đọc',
                modifiedCount: result.modifiedCount
            };
        } catch (error) {
            throw new Error(`Error marking all as read: ${error.message}`);
        }
    }

    // Xóa notification
    static async deleteNotification(notificationId) {
        try {
            const notification = await Notification.findByIdAndDelete(notificationId);

            if (!notification) {
                throw new Error('Notification không tồn tại');
            }

            return { message: 'Xóa notification thành công' };
        } catch (error) {
            throw new Error(`Error deleting notification: ${error.message}`);
        }
    }

    // Lấy số lượng unread notifications
    static async getUnreadCount(userId) {
        try {
            const count = await Notification.getUnreadCount(userId);
            return { unreadCount: count };
        } catch (error) {
            throw new Error(`Error getting unread count: ${error.message}`);
        }
    }

    // Tạo notification cho like post
    static async createLikePostNotification(postId, postAuthorId, likerId) {
        try {
            // Không tạo notification nếu user like post của chính mình
            if (postAuthorId.toString() === likerId.toString()) {
                return null;
            }

            return await this.createNotification({
                recipient: postAuthorId,
                sender: likerId,
                type: 'like_post',
                post: postId
            });
        } catch (error) {
            throw new Error(`Error creating like notification: ${error.message}`);
        }
    }

    // Tạo notification cho comment
    static async createCommentNotification(postId, postAuthorId, commenterId, commentId) {
        try {
            // Không tạo notification nếu user comment post của chính mình
            if (postAuthorId.toString() === commenterId.toString()) {
                return null;
            }

            return await this.createNotification({
                recipient: postAuthorId,
                sender: commenterId,
                type: 'comment_post',
                post: postId,
                comment: commentId
            });
        } catch (error) {
            throw new Error(`Error creating comment notification: ${error.message}`);
        }
    }

    // Tạo notification cho follow
    static async createFollowNotification(followedUserId, followerId) {
        try {
            return await this.createNotification({
                recipient: followedUserId,
                sender: followerId,
                type: 'follow'
            });
        } catch (error) {
            throw new Error(`Error creating follow notification: ${error.message}`);
        }
    }
}

module.exports = NotificationService;
