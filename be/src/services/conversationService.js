const Conversation = require('../models/Conversation');

class ConversationService {
    // Lấy tất cả conversations của user
    static async getUserConversations(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;

            console.log('getUserConversations - userId:', userId);

            const conversations = await Conversation.find({
                'participants.user': userId,
                isActive: true
            })
                .populate('participants.user', 'username profile.avatar')
                .populate('lastMessage')
                .populate('createdBy', 'username')
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            console.log('Found conversations:', conversations.length);

            const total = await Conversation.countDocuments({
                'participants.user': userId,
                isActive: true
            });

            return {
                conversations,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching conversations: ${error.message}`);
        }
    }

    // Lấy conversation theo ID
    static async getConversationById(conversationId) {
        try {
            const conversation = await Conversation.findById(conversationId)
                .populate('participants.user', 'username profile.avatar')
                .populate('lastMessage')
                .populate('createdBy', 'username')
                .populate('admins', 'username profile.avatar');

            if (!conversation) {
                throw new Error('Conversation không tồn tại');
            }

            return conversation;
        } catch (error) {
            throw new Error(`Error fetching conversation: ${error.message}`);
        }
    }

    // Tạo hoặc lấy direct conversation
    static async getOrCreateDirectConversation(user1Id, user2Id) {
        try {
            // Tìm conversation đã tồn tại
            let conversation = await Conversation.findDirectConversation(user1Id, user2Id);

            if (conversation) {
                return conversation;
            }

            // Tạo conversation mới
            conversation = new Conversation({
                type: 'direct',
                participants: [
                    { user: user1Id },
                    { user: user2Id }
                ],
                createdBy: user1Id
            });

            await conversation.save();
            await conversation.populate('participants.user', 'username profile.avatar');

            return conversation;
        } catch (error) {
            throw new Error(`Error creating conversation: ${error.message}`);
        }
    }

    // Tạo group conversation
    static async createGroupConversation(groupData) {
        try {
            const { name, avatar, createdBy, participants } = groupData;

            const conversation = new Conversation({
                type: 'group',
                name,
                avatar,
                createdBy,
                participants: participants.map(userId => ({ user: userId })),
                admins: [createdBy]
            });

            await conversation.save();
            await conversation.populate('participants.user', 'username profile.avatar');

            return conversation;
        } catch (error) {
            throw new Error(`Error creating group: ${error.message}`);
        }
    }

    // Cập nhật thông tin group
    static async updateGroupConversation(conversationId, updateData) {
        try {
            const { name, avatar } = updateData;

            const conversation = await Conversation.findByIdAndUpdate(
                conversationId,
                { name, avatar },
                { new: true, runValidators: true }
            ).populate('participants.user', 'username profile.avatar');

            if (!conversation) {
                throw new Error('Conversation không tồn tại');
            }

            return conversation;
        } catch (error) {
            throw new Error(`Error updating group: ${error.message}`);
        }
    }

    // Thêm participant vào group
    static async addParticipant(conversationId, userId) {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                throw new Error('Conversation không tồn tại');
            }

            if (conversation.type !== 'group') {
                throw new Error('Chỉ có thể thêm participant vào group');
            }

            await conversation.addParticipant(userId);
            await conversation.populate('participants.user', 'username profile.avatar');

            return conversation;
        } catch (error) {
            throw new Error(`Error adding participant: ${error.message}`);
        }
    }

    // Xóa participant khỏi group
    static async removeParticipant(conversationId, userId) {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                throw new Error('Conversation không tồn tại');
            }

            if (conversation.type !== 'group') {
                throw new Error('Chỉ có thể xóa participant khỏi group');
            }

            conversation.participants = conversation.participants.filter(
                p => p.user.toString() !== userId
            );

            await conversation.save();
            await conversation.populate('participants.user', 'username profile.avatar');

            return conversation;
        } catch (error) {
            throw new Error(`Error removing participant: ${error.message}`);
        }
    }

    // Rời khỏi group
    static async leaveConversation(conversationId, userId) {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                throw new Error('Conversation không tồn tại');
            }

            const participant = conversation.participants.find(
                p => p.user.toString() === userId
            );

            if (participant) {
                participant.leftAt = new Date();
                await conversation.save();
            }

            return { message: 'Đã rời khỏi conversation' };
        } catch (error) {
            throw new Error(`Error leaving conversation: ${error.message}`);
        }
    }
}

module.exports = ConversationService;
