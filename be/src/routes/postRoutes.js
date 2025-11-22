const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', postController.getAllPosts);
router.get('/user/:userId', postController.getUserPosts);
router.get('/:id', postController.getPostById);

// Protected routes (cần authentication)
router.post('/', authenticate, postController.createPost);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);
router.post('/:id/like', authenticate, postController.likePost);

module.exports = router;