const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware để xác thực JWT token
const authenticate = async (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token không tồn tại. Vui lòng đăng nhập.'
            });
        }

        const token = authHeader.substring(7); // Bỏ "Bearer "

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lấy user từ database
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User không tồn tại.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa.'
            });
        }

        // Attach user vào request
        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token đã hết hạn. Vui lòng đăng nhập lại.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Lỗi xác thực: ' + error.message
        });
    }
};

// Middleware cho optional authentication (public/private content)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Không có token, tiếp tục nhưng không có user
            req.user = null;
            req.userId = null;
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (user && user.isActive) {
            req.user = user;
            req.userId = user._id;
        } else {
            req.user = null;
            req.userId = null;
        }

        next();
    } catch (error) {
        // Nếu có lỗi, coi như không có authentication
        req.user = null;
        req.userId = null;
        next();
    }
};

// Middleware để check quyền owner (chỉ owner mới được sửa/xóa)
const checkOwnership = (resourceField = 'author') => {
    return (req, res, next) => {
        // Middleware này cần được dùng sau authenticate
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập.'
            });
        }

        // Resource sẽ được attach vào req bởi controller
        // Ví dụ: req.post, req.comment, etc.
        next();
    };
};

module.exports = {
    authenticate,
    optionalAuth,
    checkOwnership
};
