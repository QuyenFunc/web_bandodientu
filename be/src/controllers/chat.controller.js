const { ChatMessage, User, sequelize } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

// Get chat history for a specific user
const getChatHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Users can only view their own chat, Admins can view any
    if (!isAdmin && currentUserId !== userId) {
      throw new AppError('Không có quyền xem cuộc trò chuyện này', 403);
    }

    const messages = await ChatMessage.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// Get list of users with chat history (for Admin Dashboard)
const getAdminChatList = async (req, res, next) => {
  try {
    // fetch distinct userIds grouped by max createdAt
    const users = await ChatMessage.findAll({
      attributes: [
        'userId',
        [sequelize.fn('MAX', sequelize.col('created_at')), 'lastMessageAt'],
      ],
      group: ['userId'],
      order: [[sequelize.literal('MAX(created_at)'), 'DESC']],
    });

    // For each item, append last active content
    const listWithDetails = await Promise.all(
      users.map(async (item) => {
        const lastMessage = await ChatMessage.findOne({
          where: { userId: item.userId },
          order: [['createdAt', 'DESC']],
        });

        const unreadCount = await ChatMessage.count({
          where: { userId: item.userId, isFromAdmin: false, isRead: false },
        });

        const chatUser = await User.findByPk(item.userId, {
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
        });

        // Use standard format return
        return {
          userId: item.userId,
          user: chatUser,
          lastMessage: lastMessage ? lastMessage.content : '',
          lastMessageAt: item.getDataValue('lastMessageAt'),
          unreadCount,
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: listWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChatHistory,
  getAdminChatList,
};
