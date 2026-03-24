const { ChatMessage, User } = require('../models');
const logger = require('../utils/logger');

module.exports = (io) => {
  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    // User joins a personal room and/or session room
    socket.on('join', (data) => {
      const { userId, sessionId } = typeof data === 'string' ? { userId: data } : data;
      if (userId) {
        socket.join(userId);
        logger.info(`👤 User joined user room: ${userId}`);
      }
      if (sessionId) {
        socket.join(sessionId);
        logger.info(`🆔 User joined session room: ${sessionId}`);
      }
    });

    // Admin joins the dashboard (can listen to broadcasts or general updates)
    socket.on('adminJoin', () => {
      socket.join('admin-room');
      logger.info('🛡️ Admin joined admin-room');
    });

    // Listen to messages
    socket.on('sendMessage', async (data) => {
      try {
        const { userId, senderId, content, isFromAdmin, sessionId } = data;

        if ((!userId && !sessionId) || !senderId || !content) {
          return socket.emit('error', { message: 'Missing fields' });
        }

        // Save to Database
        const message = await ChatMessage.create({
          userId: userId || null,
          sessionId: sessionId || userId, // Fallback to userId if no sessionId provided
          senderId,
          content,
          isFromAdmin: !!isFromAdmin,
          isRead: false,
        });

        // Broadcast to specific Room
        // We prefer sessionId for specific conversation
        const targetRoom = sessionId || userId;
        io.to(targetRoom).emit('messageRecieved', message);

        // Also notify general admin room for updating dashboard view instantly
        io.to('admin-room').emit('messageRecieved', message);

        if (!isFromAdmin) {
          io.to('admin-room').emit('newChatAlert', {
            userId,
            sessionId: sessionId || userId,
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
