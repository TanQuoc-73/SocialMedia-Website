const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    validateRegister,
    validateLogin,
    validateChangePassword
} = require('../middleware/validation');

// Public routes (không cần authentication) - with rate limiting

// POST /auth/register - Đăng ký user mới
router.post('/register', authLimiter, validateRegister, authController.register);

// POST /auth/login - Đăng nhập
router.post('/login', authLimiter, validateLogin, authController.login);

// POST /auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

// POST /auth/verify - Verify token
router.post('/verify', authController.verifyToken);

// Protected routes (cần authentication)

// GET /auth/me - Lấy thông tin user hiện tại
router.get('/me', authenticate, authController.getCurrentUser);

// POST /auth/logout - Đăng xuất
router.post('/logout', authenticate, authController.logout);

// PUT /auth/change-password - Đổi mật khẩu
router.put('/change-password', authenticate, validateChangePassword, authController.changePassword);

module.exports = router;
