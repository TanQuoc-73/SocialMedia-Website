const MessageService = require('../services/messageService');

const messageController = {
    // GET /chat/messages?conversationId=xxx
    getConversationMessages: async (req, res, next) => {
        try {
            const { conversationId, page, limit } = req.query;

            if (!conversationId) {
                return res.status(400).json({
                    success: false,
                    message: 'conversationId là bắt buộc'
                });
            }

            const result = await MessageService.getConversationMessages(conversationId, page, limit);

            res.json({
                success: true,
                data: result.messages,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /chat/messages
    createMessage: async (req, res, next) => {
        try {
            const { conversationId, content, type } = req.body;

            if (!conversationId || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'conversationId và content là bắt buộc'
                });
            }

            const messageData = {
                conversation: conversationId,
                sender: req.userId,
                content,
                messageType: type || 'text'
            };

            const message = await MessageService.createMessage(messageData);

            res.status(201).json({
                success: true,
                message: 'Gửi message thành công',
                data: message
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /messages/:id
    updateMessage: async (req, res, next) => {
        try {
            const message = await MessageService.updateMessage(req.params.id, req.body);

            res.json({
                success: true,
                message: 'Cập nhật message thành công',
                data: message
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /messages/:id
    deleteMessage: async (req, res, next) => {
        try {
            const result = await MessageService.deleteMessage(req.params.id);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /messages/:id/read
    markAsRead: async (req, res, next) => {
        try {
            const { userId } = req.body;
            const result = await MessageService.markAsRead(req.params.id, userId);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /messages/:id/reaction
    addReaction: async (req, res, next) => {
        try {
            const { userId, emoji } = req.body;
            const result = await MessageService.addReaction(req.params.id, userId, emoji);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /messages/:id/reaction
    removeReaction: async (req, res, next) => {
        try {
            const { userId, emoji } = req.body;
            const result = await MessageService.removeReaction(req.params.id, userId, emoji);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = messageController;
