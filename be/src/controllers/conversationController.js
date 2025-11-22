const ConversationService = require('../services/conversationService');

const conversationController = {
    // GET /chat/conversations - Get user's conversations
    getUserConversations: async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await ConversationService.getUserConversations(req.userId, page, limit);

            res.json({
                success: true,
                data: result.conversations,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /chat/conversations/:id
    getConversationById: async (req, res, next) => {
        try {
            const conversation = await ConversationService.getConversationById(req.params.id);

            res.json({
                success: true,
                data: conversation
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /chat/conversations/direct
    getOrCreateDirectConversation: async (req, res, next) => {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId là bắt buộc'
                });
            }

            const conversation = await ConversationService.getOrCreateDirectConversation(req.userId, userId);

            res.json({
                success: true,
                data: conversation
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /chat/conversations/group
    createGroupConversation: async (req, res, next) => {
        try {
            const conversation = await ConversationService.createGroupConversation(req.body);

            res.status(201).json({
                success: true,
                message: 'Tạo group thành công',
                data: conversation
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /chat/conversations/:id
    updateGroupConversation: async (req, res, next) => {
        try {
            const conversation = await ConversationService.updateGroupConversation(req.params.id, req.body);

            res.json({
                success: true,
                message: 'Cập nhật group thành công',
                data: conversation
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /chat/conversations/:id/participants
    addParticipant: async (req, res, next) => {
        try {
            const { userId } = req.body;
            const conversation = await ConversationService.addParticipant(req.params.id, userId);

            res.json({
                success: true,
                message: 'Thêm participant thành công',
                data: conversation
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /chat/conversations/:id/participants/:userId
    removeParticipant: async (req, res, next) => {
        try {
            const conversation = await ConversationService.removeParticipant(
                req.params.id,
                req.params.userId
            );

            res.json({
                success: true,
                message: 'Xóa participant thành công',
                data: conversation
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /chat/conversations/:id/leave
    leaveConversation: async (req, res, next) => {
        try {
            const result = await ConversationService.leaveConversation(req.params.id, req.userId);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = conversationController;
