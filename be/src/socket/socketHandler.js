const { Message, messages } = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Tham gia phòng chat
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);

      // Gửi lịch sử chat cho user mới
      const roomMessages = messages.get(room) || [];
      socket.emit('chat_history', roomMessages);
    });

    // Rời phòng chat
    socket.on('leave_room', (room) => {
      socket.leave(room);
      console.log(`User ${socket.id} left room: ${room}`);
    });

    // Nhận tin nhắn mới
    socket.on('send_message', (data) => {
      const { room, sender, content } = data;

      // Tạo tin nhắn mới
      const newMessage = new Message(sender, content, room);

      // Lưu tin nhắn
      if (!messages.has(room)) {
        messages.set(room, []);
      }
      messages.get(room).push(newMessage);

      // Giới hạn lịch sử tin nhắn (100 tin gần nhất)
      const roomMessages = messages.get(room);
      if (roomMessages.length > 100) {
        roomMessages.shift();
      }

      // Gửi tin nhắn đến tất cả user trong phòng
      io.to(room).emit('receive_message', newMessage.toJSON());

      console.log(`Message sent in room ${room}: ${content}`);
    });

    // Typing indicator
    socket.on('typing_start', (data) => {
      const { room, user } = data;
      socket.to(room).emit('user_typing', { user, isTyping: true });
    });

    socket.on('typing_stop', (data) => {
      const { room, user } = data;
      socket.to(room).emit('user_typing', { user, isTyping: false });
    });

    // User disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};