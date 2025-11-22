const Conversation = require('../../models/Conversation');

function conversationHandler(io, socket) {
    // Join conversation room
    socket.on('join_conversation', async (data, callback) => {
        try {
            const { conversationId } = data;

            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return callback({ error: 'Conversation not found' });
            }

            // Verify user is participant
            if (!conversation.participants.includes(socket.userId)) {
                return callback({ error: 'Not a participant' });
            }

            // Join room
            socket.join(`conversation:${conversationId}`);

            console.log(`User ${socket.userId} joined conversation ${conversationId}`);

            callback({ success: true });

        } catch (error) {
            console.error('Join conversation error:', error);
            callback({ error: error.message });
        }
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Create conversation (notify participants)
    socket.on('conversation_created', async (data) => {
        try {
            const { conversationId, participants } = data;

            // Notify all participants
            participants.forEach(participantId => {
                if (participantId !== socket.userId) {
                    io.to(`user:${participantId}`).emit('new_conversation', {
                        conversationId,
                        createdBy: socket.userId
                    });
                }
            });

        } catch (error) {
            console.error('Conversation created error:', error);
        }
    });

    // Add participant to group
    socket.on('add_participant', async (data, callback) => {
        try {
            const { conversationId, userId } = data;

            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return callback({ error: 'Conversation not found' });
            }

            // Only admins can add participants
            if (!conversation.admins.includes(socket.userId)) {
                return callback({ error: 'Only admins can add participants' });
            }

            await conversation.addParticipant(userId);

            // Notify all participants
            io.to(`conversation:${conversationId}`).emit('participant_added', {
                conversationId,
                userId,
                addedBy: socket.userId
            });

            // Notify new participant
            io.to(`user:${userId}`).emit('added_to_conversation', {
                conversationId,
                addedBy: socket.userId
            });

            callback({ success: true });

        } catch (error) {
            console.error('Add participant error:', error);
            callback({ error: error.message });
        }
    });

    // Remove participant from group
    socket.on('remove_participant', async (data, callback) => {
        try {
            const { conversationId, userId } = data;

            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return callback({ error: 'Conversation not found' });
            }

            // Only admins can remove participants
            if (!conversation.admins.includes(socket.userId)) {
                return callback({ error: 'Only admins can remove participants' });
            }

            // Remove participant
            conversation.participants = conversation.participants.filter(
                p => p.toString() !== userId
            );
            await conversation.save();

            // Notify all participants
            io.to(`conversation:${conversationId}`).emit('participant_removed', {
                conversationId,
                userId,
                removedBy: socket.userId
            });

            // Notify removed participant
            io.to(`user:${userId}`).emit('removed_from_conversation', {
                conversationId,
                removedBy: socket.userId
            });

            callback({ success: true });

        } catch (error) {
            console.error('Remove participant error:', error);
            callback({ error: error.message });
        }
    });
}

module.exports = conversationHandler;
