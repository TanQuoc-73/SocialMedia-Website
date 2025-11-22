const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.get('/:id/friends', userController.getUserFriends);
router.get('/:id/followers', userController.getUserFollowers);
router.get('/:id/following', userController.getUserFollowing);

// Protected routes
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);
router.post('/:id/follow', authenticate, userController.followUser);
router.post('/:id/unfollow', authenticate, userController.unfollowUser);

module.exports = router;
