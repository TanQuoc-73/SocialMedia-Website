const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

class MessageService {
    // Lấy messages của một conversation
    static async getConversationMessages(conversationId, page = 1, limit = 50) {
        try {
            const messages = await Message.getConversationMessages(
                conversationId,
                parseInt(page),
                parseInt(limit)
            );

            const total = await Message.countDocuments({
                conversation: conversationId,
                isDeleted: false
            });

            return {
                messages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching messages: ${error.message}`);
        }
    }

    // Tạo message mới
    static async createMessage(messageData) {
        try {
            const { conversation, sender, content, media, messageType, repliedTo } = messageData;

            const message = new Message({
                conversation,
                sender,
                content,
                media,
                messageType,
                repliedTo
            });

            await message.save();
            await message.populate('sender', 'username profile.avatar');

            // Cập nhật lastMessage của conversation
            await Conversation.findByIdAndUpdate(conversation, {
                lastMessage: message._id
            });

            return message;
        } catch (error) {
            throw new Error(`Error creating message: ${error.message}`);
        }
    }

    // Cập nhật message
    static async updateMessage(messageId, updateData) {
        try {
            const { content } = updateData;

            const message = await Message.findByIdAndUpdate(
                messageId,
                { content, isEdited: true },
                { new: true, runValidators: true }
            ).populate('sender', 'username profile.avatar');

            if (!message) {
                throw new Error('Message không tồn tại');
            }

            return message;
        } catch (error) {
            throw new Error(`Error updating message: ${error.message}`);
        }
    }

    // Xóa message (soft delete)
    static async deleteMessage(messageId) {
        try {
            const message = await Message.findByIdAndUpdate(
                messageId,
                { isDeleted: true },
                { new: true }
            );

            if (!message) {
                throw new Error('Message không tồn tại');
            }

            return { message: 'Xóa message thành công' };
        } catch (error) {
            throw new Error(`Error deleting message: ${error.message}`);
        }
    }

    // Đánh dấu message đã đọc
    static async markAsRead(messageId, userId) {
        try {
            const message = await Message.findById(messageId);

            if (!message) {
                throw new Error('Message không tồn tại');
            }

            await message.markAsRead(userId);

            return { message: 'Đã đánh dấu đã đọc' };
        } catch (error) {
            throw new Error(`Error marking as read: ${error.message}`);
        }
    }

    // Thêm reaction
    static async addReaction(messageId, userId, emoji) {
        try {
            const message = await Message.findById(messageId);

            if (!message) {
                throw new Error('Message không tồn tại');
            }

            await message.addReaction(userId, emoji);

            return { message: 'Đã thêm reaction' };
        } catch (error) {
            throw new Error(`Error adding reaction: ${error.message}`);
        }
    }

    // Xóa reaction
    static async removeReaction(messageId, userId, emoji) {
        try {
            const message = await Message.findById(messageId);

            if (!message) {
                throw new Error('Message không tồn tại');
            }

            message.reactions = message.reactions.filter(
                r => !(r.user.toString() === userId && r.emoji === emoji)
            );

            await message.save();

            return { message: 'Đã xóa reaction' };
        } catch (error) {
            throw new Error(`Error removing reaction: ${error.message}`);
        }
    }
}

module.exports = MessageService;
