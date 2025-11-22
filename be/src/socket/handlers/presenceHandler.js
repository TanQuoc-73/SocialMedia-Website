const User = require('../../models/User');

function presenceHandler(io, socket, onlineUsers) {
    // Get online status of specific users
    socket.on('get_online_users', (data, callback) => {
        try {
            const { userIds } = data;

            const onlineUserIds = userIds.filter(userId =>
                onlineUsers.has(userId)
            );

            callback({
                success: true,
                onlineUsers: onlineUserIds
            });

        } catch (error) {
            console.error('Get online users error:', error);
            callback({ error: error.message });
        }
    });

    // Get all online users (for admin/debugging)
    socket.on('get_all_online', (callback) => {
        try {
            const allOnline = Array.from(onlineUsers.keys());

            callback({
                success: true,
                count: allOnline.length,
                users: allOnline
            });

        } catch (error) {
            console.error('Get all online error:', error);
            callback({ error: error.message });
        }
    });

    // Update user's last seen
    socket.on('update_last_seen', async () => {
        try {
            await User.findByIdAndUpdate(socket.userId, {
                lastSeen: new Date()
            });

        } catch (error) {
            console.error('Update last seen error:', error);
        }
    });

    // Set user status (online, away, busy, offline)
    socket.on('set_status', async (data, callback) => {
        try {
            const { status } = data; // 'online', 'away', 'busy', 'offline'

            // Broadcast status change
            socket.broadcast.emit('user_status_changed', {
                userId: socket.userId,
                status,
                timestamp: new Date()
            });

            callback({ success: true });

        } catch (error) {
            console.error('Set status error:', error);
            callback({ error: error.message });
        }
    });
}

module.exports = presenceHandler;
