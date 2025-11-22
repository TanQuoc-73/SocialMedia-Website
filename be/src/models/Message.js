const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: String,
  media: [{
    url: String,
    type: { type: String, enum: ['image', 'video', 'file'] },
    name: String,
    size: Number
  }],
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'system'],
    default: 'text'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: { type: Date, default: Date.now }
  }],
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  repliedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    reactedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index để query messages nhanh hơn
messageSchema.index({ conversation: 1, createdAt: -1 });

// Method để đánh dấu message đã đọc
messageSchema.methods.markAsRead = function (userId) {
  const alreadyRead = this.readBy.some(r => r.user.toString() === userId.toString());
  if (!alreadyRead) {
    this.readBy.push({ user: userId });
    return this.save();
  }
  return this;
};

// Method để thêm reaction
messageSchema.methods.addReaction = function (userId, emoji) {
  const existingReaction = this.reactions.find(
    r => r.user.toString() === userId.toString() && r.emoji === emoji
  );

  if (!existingReaction) {
    this.reactions.push({ user: userId, emoji });
    return this.save();
  }
  return this;
};

// Static method để lấy messages của conversation với pagination
messageSchema.statics.getConversationMessages = function (conversationId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  return this.find({
    conversation: conversationId,
    isDeleted: false
  })
    .populate('sender', 'username profile.avatar')
    .populate('repliedTo', 'content sender')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Message', messageSchema);