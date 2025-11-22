const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');

function chatHandler(io, socket) {
    // Send message - listen for message:send from frontend
    socket.on('message:send', async (data, callback) => {
        try {
            const { conversationId, message } = data;

            // Verify user is participant
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return callback?.({ error: 'Conversation not found' });
            }

            const isParticipant = conversation.participants.some(
                p => p.user?.toString() === socket.userId || p.toString() === socket.userId
            );

            if (!isParticipant) {
                return callback?.({ error: 'Not a participant' });
            }

            // Populate message sender info
            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'username profile.avatar');

            // Update conversation's last message
            conversation.lastMessage = message._id;
            conversation.updatedAt = new Date();
            await conversation.save();

            // Emit to all participants in conversation - use message:new
            conversation.participants.forEach(participant => {
                const participantId = participant.user?.toString() || participant.toString();
                io.to(`user:${participantId}`).emit('message:new', {
                    conversationId,
                    message: populatedMessage
                });
            });

            // Send confirmation to sender
            if (callback) callback({ success: true, message: populatedMessage });

        } catch (error) {
            console.error('Send message error:', error);
            if (callback) callback({ error: error.message });
        }
    });

    // Typing indicator - start
    socket.on('typing_start', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
            userId: socket.userId,
            conversationId,
            username: socket.user.username
        });
    });

    // Typing indicator - stop
    socket.on('typing_stop', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('typing_stopped', {
            userId: socket.userId,
            conversationId
        });
    });

    // Mark message as read
    socket.on('message_read', async (data, callback) => {
        try {
            const { messageId } = data;

            const message = await Message.findById(messageId);
            if (!message) {
                return callback({ error: 'Message not found' });
            }

            // Mark as read
            await message.markAsRead(socket.userId);

            // Notify sender
            io.to(`user:${message.sender}`).emit('message_read', {
                messageId,
                readBy: socket.userId,
                timestamp: new Date()
            });

            callback({ success: true });

        } catch (error) {
            console.error('Mark read error:', error);
            callback({ error: error.message });
        }
    });

    // Delete message
    socket.on('delete_message', async (data, callback) => {
        try {
            const { messageId } = data;

            const message = await Message.findById(messageId);
            if (!message) {
                return callback({ error: 'Message not found' });
            }

            // Only sender can delete
            if (message.sender.toString() !== socket.userId) {
                return callback({ error: 'Unauthorized' });
            }

            message.isDeleted = true;
            await message.save();

            // Notify conversation
            io.to(`conversation:${message.conversation}`).emit('message_deleted', {
                messageId,
                conversationId: message.conversation
            });

            callback({ success: true });

        } catch (error) {
            console.error('Delete message error:', error);
            callback({ error: error.message });
        }
    });

    // Add reaction
    socket.on('add_reaction', async (data, callback) => {
        try {
            const { messageId, emoji } = data;

            const message = await Message.findById(messageId);
            if (!message) {
                return callback({ error: 'Message not found' });
            }

            await message.addReaction(socket.userId, emoji);

            // Notify conversation
            io.to(`conversation:${message.conversation}`).emit('reaction_added', {
                messageId,
                userId: socket.userId,
                emoji
            });

            callback({ success: true });

        } catch (error) {
            console.error('Add reaction error:', error);
            callback({ error: error.message });
        }
    });
}

module.exports = chatHandler;
