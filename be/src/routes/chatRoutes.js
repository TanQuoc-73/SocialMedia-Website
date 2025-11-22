const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const conversationController = require('../controllers/conversationController');
const { authenticate } = require('../middleware/auth');

// All chat routes require authentication
router.use(authenticate);

// ===== CONVERSATION ROUTES =====

router.get('/conversations', conversationController.getUserConversations);
router.get('/conversations/:id', conversationController.getConversationById);
router.post('/conversations/direct', conversationController.getOrCreateDirectConversation);
router.post('/conversations/group', conversationController.createGroupConversation);
router.put('/conversations/:id', conversationController.updateGroupConversation);
router.post('/conversations/:id/participants', conversationController.addParticipant);
router.delete('/conversations/:id/participants/:userId', conversationController.removeParticipant);
router.post('/conversations/:id/leave', conversationController.leaveConversation);

// ===== MESSAGE ROUTES =====

router.get('/messages', messageController.getConversationMessages);
router.post('/messages', messageController.createMessage);
router.put('/messages/:id', messageController.updateMessage);
router.delete('/messages/:id', messageController.deleteMessage);
router.put('/messages/:id/read', messageController.markAsRead);
router.post('/messages/:id/reaction', messageController.addReaction);
router.delete('/messages/:id/reaction', messageController.removeReaction);

module.exports = router;