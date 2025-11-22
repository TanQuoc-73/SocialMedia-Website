const Notification = require('../../models/Notification');

function notificationHandler(io, socket) {
    // Send notification to specific user(s)
    socket.on('send_notification', async (data, callback) => {
        try {
            const { recipientId, type, content, relatedPost, relatedComment } = data;

            // Create notification
            const notification = new Notification({
                recipient: recipientId,
                sender: socket.userId,
                type,
                content,
                relatedPost,
                relatedComment
            });

            await notification.save();
            await notification.populate('sender', 'username profile.avatar');

            // Send to recipient
            io.to(`user:${recipientId}`).emit('new_notification', notification);

            callback({ success: true, notification });

        } catch (error) {
            console.error('Send notification error:', error);
            callback({ error: error.message });
        }
    });

    // Mark notification as read
    socket.on('mark_notification_read', async (data, callback) => {
        try {
            const { notificationId } = data;

            const notification = await Notification.findById(notificationId);
            if (!notification) {
                return callback({ error: 'Notification not found' });
            }

            // Only recipient can mark as read
            if (notification.recipient.toString() !== socket.userId) {
                return callback({ error: 'Unauthorized' });
            }

            await notification.markAsRead();

            callback({ success: true });

        } catch (error) {
            console.error('Mark notification read error:', error);
            callback({ error: error.message });
        }
    });
}

// Helper function to emit notifications (can be called from controllers)
function emitNotification(io, recipientId, notification) {
    io.to(`user:${recipientId}`).emit('new_notification', notification);
}

// Helper for like notification
function emitLikeNotification(io, recipientId, data) {
    io.to(`user:${recipientId}`).emit('post_liked', data);
}

// Helper for comment notification
function emitCommentNotification(io, recipientId, data) {
    io.to(`user:${recipientId}`).emit('new_comment', data);
}

// Helper for follow notification
function emitFollowNotification(io, recipientId, data) {
    io.to(`user:${recipientId}`).emit('new_follower', data);
}

module.exports = notificationHandler;
module.exports.emitNotification = emitNotification;
module.exports.emitLikeNotification = emitLikeNotification;
module.exports.emitCommentNotification = emitCommentNotification;
module.exports.emitFollowNotification = emitFollowNotification;
