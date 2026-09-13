import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

conversationSchema.statics.findOrCreate = async function(userId1, userId2) {
  const participants = [userId1, userId2].sort();
  let conversation = await this.findOne({
    participants: { $all: participants, $size: 2 }
  }).populate('participants', 'name username avatar isOnline lastSeen');

  if (!conversation) {
    conversation = await this.create({ participants });
    conversation = await this.findById(conversation._id).populate('participants', 'name username avatar isOnline lastSeen');
  }
  return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;