const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', commentController.getCommentsByPost);
router.get('/:id/replies', commentController.getReplies);

// Protected routes (cần authentication)
router.post('/', authenticate, commentController.createComment);
router.put('/:id', authenticate, commentController.updateComment);
router.delete('/:id', authenticate, commentController.deleteComment);
router.post('/:id/like', authenticate, commentController.toggleLike);

module.exports = router;
