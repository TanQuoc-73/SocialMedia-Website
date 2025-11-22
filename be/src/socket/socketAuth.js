const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket.IO authentication middleware
const socketAuth = async (socket, next) => {
    try {
        // Get token from handshake auth
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        // Remove "Bearer " if present
        const cleanToken = token.replace('Bearer ', '');

        // Verify token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password -refreshToken');

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        if (!user.isActive) {
            return next(new Error('Authentication error: Account disabled'));
        }

        // Attach user to socket
        socket.user = user;
        socket.userId = user._id.toString();

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new Error('Authentication error: Invalid token'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new Error('Authentication error: Token expired'));
        }
        return next(new Error('Authentication error: ' + error.message));
    }
};

module.exports = socketAuth;
