import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access these messages' });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar');

    const total = await Message.countDocuments({ conversationId });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, conversationId } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: 'Receiver and message text are required' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    } else {
      conversation = await Conversation.findOrCreate(req.user._id, receiverId);
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to send message in this conversation' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      conversationId: conversation._id,
      text: text.trim(),
      status: 'sent'
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const messageId = req.params.id || req.params.messageId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (message.status !== 'read') {
      message.status = 'read';
      await message.save();
    }

    res.json(message);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markConversationAsRead = async (conversationId, userId) => {
  try {
    await Message.updateMany(
      { conversationId, receiver: userId, status: { $ne: 'read' } },
      { status: 'read' }
    );
  } catch (error) {
    console.error('Mark conversation as read error:', error);
  }
};

export const updateMessageStatus = async (messageId, status) => {
  try {
    await Message.findByIdAndUpdate(messageId, { status });
  } catch (error) {
    console.error('Update message status error:', error);
  }
};