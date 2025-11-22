const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: [
            'like_post', 'comment_post', 'share_post',
            'follow', 'mention', 'message',
            'friend_request', 'post_approved'
        ],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Index để query notifications của user
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

// Method để đánh dấu đã đọc
notificationSchema.methods.markAsRead = function () {
    this.isRead = true;
    return this.save();
};

// Static method để lấy notifications của user
notificationSchema.statics.getUserNotifications = function (userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.find({ recipient: userId })
        .populate('sender', 'username profile.avatar')
        .populate('post', 'content')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static method để đếm unread notifications
notificationSchema.statics.getUnreadCount = function (userId) {
    return this.countDocuments({
        recipient: userId,
        isRead: false
    });
};

// Static method để đánh dấu tất cả là đã đọc
notificationSchema.statics.markAllAsRead = function (userId) {
    return this.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
    );
};

module.exports = mongoose.model('Notification', notificationSchema);