const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: { type: Date, default: Date.now },
        leftAt: Date
    }],
    type: {
        type: String,
        enum: ['direct', 'group'],
        default: 'direct'
    },
    name: String,
    avatar: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Index để tìm kiếm conversation nhanh hơn
conversationSchema.index({ 'participants.user': 1 });

// Method để kiểm tra user có phải participant không
conversationSchema.methods.isParticipant = function (userId) {
    return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method để thêm participant
conversationSchema.methods.addParticipant = function (userId) {
    if (!this.isParticipant(userId)) {
        this.participants.push({ user: userId });
        return this.save();
    }
    return this;
};

// Static method để tìm conversation giữa 2 users
conversationSchema.statics.findDirectConversation = function (user1Id, user2Id) {
    return this.findOne({
        type: 'direct',
        'participants.user': { $all: [user1Id, user2Id] }
    });
};

module.exports = mongoose.model('Conversation', conversationSchema);