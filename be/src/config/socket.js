const { ChatMessage, User } = require('../models');
const logger = require('../utils/logger');

module.exports = (io) => {
  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    // User joins a personal room (one room per user ID)
    socket.on('join', (userId) => {
      socket.join(userId);
      logger.info(`👤 User joined room: ${userId}`);
    });

    // Admin joins the dashboard (can listen to broadcasts or general updates)
    socket.on('adminJoin', () => {
      socket.join('admin-room');
      logger.info('🛡️ Admin joined admin-room');
    });

    // Listen to messages
    socket.on('sendMessage', async (data) => {
      try {
        const { userId, senderId, content, isFromAdmin } = data;

        if (!userId || !senderId || !content) {
          return socket.emit('error', { message: 'Missing fields' });
        }

        // Save to Database
        const message = await ChatMessage.create({
          userId,
          senderId,
          content,
          isFromAdmin: !!isFromAdmin,
          isRead: false,
        });

        // Broadcast to specific User Room (so user and admin in that room see it)
        io.to(userId).emit('messageRecieved', message);

        // Also notify general admin room for updating dashboard view instantly
        io.to('admin-room').emit('messageRecieved', message);

        if (!isFromAdmin) {
          io.to('admin-room').emit('newChatAlert', {
            userId,
            content,
            createdAt: message.createdAt,
          });
        }
      } catch (error) {
        logger.error('Socket sendMessage error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
