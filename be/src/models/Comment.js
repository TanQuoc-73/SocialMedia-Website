const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    media: {
        url: String,
        type: { type: String, enum: ['image', 'video'] }
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likesCount: { type: Number, default: 0 },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    isEdited: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Pre-save middleware để update likesCount
commentSchema.pre('save', function (next) {
    this.likesCount = this.likes.length;
    next();
});

// Method để lấy replies của comment
commentSchema.statics.getReplies = function (commentId) {
    return this.find({ parentComment: commentId })
        .populate('author', 'username profile.avatar')
        .sort({ createdAt: 1 });
};

module.exports = mongoose.model('Comment', commentSchema);