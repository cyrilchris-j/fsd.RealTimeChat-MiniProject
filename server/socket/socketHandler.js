import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { markConversationAsRead, updateMessageStatus } from '../controllers/messageController.js';

const userSockets = new Map();
const userConversations = new Map();

export const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${socket.user.name} (${userId})`);

    userSockets.set(userId, socket.id);
    socket.join(userId);

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: null });

    // Send current online users list to the newly connected socket
    socket.emit('onlineUsers', Array.from(userSockets.keys()));

    // Broadcast online status to all clients
    io.emit('userStatus', { userId, isOnline: true, lastSeen: null });

    socket.on('userOnline', async () => {
      userSockets.set(userId, socket.id);
      socket.join(userId);
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: null });
      socket.emit('onlineUsers', Array.from(userSockets.keys()));
      io.emit('userStatus', { userId, isOnline: true, lastSeen: null });
    });

    socket.on('joinConversation', async (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId);
      userConversations.set(socket.id, conversationId.toString());
      await markConversationAsRead(conversationId, userId);
      // Notify sender that their unread messages have been read
      socket.to(conversationId).emit('conversationRead', { conversationId, readerId: userId });
    });

    socket.on('leaveConversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(conversationId);
      if (userConversations.get(socket.id) === conversationId.toString()) {
        userConversations.delete(socket.id);
      }
    });

    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, text, conversationId, tempId } = data;

        if (!receiverId || !text || !text.trim()) {
          socket.emit('messageError', { tempId, error: 'Receiver and text are required' });
          return;
        }

        let conversation;
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
        } else {
          conversation = await Conversation.findOrCreate(userId, receiverId);
        }

        if (!conversation) {
          socket.emit('messageError', { tempId, error: 'Conversation not found' });
          return;
        }

        const isParticipant = conversation.participants.some(
          p => p.toString() === userId
        );

        if (!isParticipant) {
          socket.emit('messageError', { tempId, error: 'Not authorized' });
          return;
        }

        let initialStatus = 'sent';
        const receiverSocketId = userSockets.get(receiverId);

        if (receiverSocketId) {
          const receiverCurrentConv = userConversations.get(receiverSocketId);
          if (receiverCurrentConv === conversation._id.toString()) {
            initialStatus = 'read';
          } else {
            initialStatus = 'delivered';
          }
        }

        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          conversationId: conversation._id,
          text: text.trim(),
          status: initialStatus
        });

        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name username avatar')
          .populate('receiver', 'name username avatar');

        // Send confirmation back to sender
        socket.emit('messageSent', { tempId, message: populatedMessage });

        // Deliver real-time message to receiver if connected
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', populatedMessage);

          if (initialStatus === 'read') {
            io.to(socket.id).emit('messageRead', {
              messageId: message._id,
              conversationId: conversation._id
            });
          } else if (initialStatus === 'delivered') {
            io.to(socket.id).emit('messageDelivered', {
              messageId: message._id,
              conversationId: conversation._id
            });
          }
        }
      } catch (error) {
        console.error('Send message socket error:', error);
        socket.emit('messageError', { tempId: data.tempId, error: 'Failed to send message' });
      }
    });

    socket.on('typing', (data) => {
      const { conversationId, receiverId } = data;
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', { conversationId, senderId: userId });
      }
    });

    socket.on('stopTyping', (data) => {
      const { conversationId, receiverId } = data;
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStoppedTyping', { conversationId, senderId: userId });
      }
    });

    socket.on('messageRead', async (data) => {
      const { messageId, conversationId, senderId } = data;
      if (messageId) {
        await updateMessageStatus(messageId, 'read');
      }
      const senderSocketId = userSockets.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageRead', { messageId, conversationId });
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.name} (${userId})`);
      userSockets.delete(userId);
      userConversations.delete(socket.id);

      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
      io.emit('userStatus', { userId, isOnline: false, lastSeen });
    });
  });
};

export const getUserSocketId = (userId) => userSockets.get(userId);