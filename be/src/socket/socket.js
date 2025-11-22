const { Server } = require('socket.io');
const socketAuth = require('./socketAuth');
const chatHandler = require('./handlers/chatHandler');
const conversationHandler = require('./handlers/conversationHandler');
const presenceHandler = require('./handlers/presenceHandler');
const notificationHandler = require('./handlers/notificationHandler');

// Store online users
const onlineUsers = new Map(); // userId -> socketId

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use(socketAuth);

    // Connection handler
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Add user to online users
        onlineUsers.set(socket.userId, socket.id);

        // Join user's personal room
        socket.join(`user:${socket.userId}`);

        // Broadcast user online status
        socket.broadcast.emit('user_online', {
            userId: socket.userId,
            timestamp: new Date()
        });

        // Register event handlers
        chatHandler(io, socket);
        conversationHandler(io, socket);
        presenceHandler(io, socket, onlineUsers);
        notificationHandler(io, socket);

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);

            // Remove from online users
            onlineUsers.delete(socket.userId);

            // Broadcast user offline status
            socket.broadcast.emit('user_offline', {
                userId: socket.userId,
                timestamp: new Date()
            });
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
}

module.exports = { initializeSocket, onlineUsers };
