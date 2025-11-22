const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX) || 10,
    message: {
        success: false,
        message: 'Too many uploads, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for creating posts/comments
const createLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 posts/comments per minute
    message: {
        success: false,
        message: 'You are posting too quickly, please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for Socket.IO events (applied in socket handlers)
const socketLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 events per minute
    message: 'Too many socket events, please slow down.',
    standardHeaders: false,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
    uploadLimiter,
    createLimiter,
    socketLimiter
};
