import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.emit('userOnline');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.setupEventForwarding();

    return this.socket;
  }

  setupEventForwarding() {
    const events = [
      'onlineUsers',
      'userStatus',
      'receiveMessage',
      'userTyping',
      'userStoppedTyping',
      'messageDelivered',
      'messageRead',
      'conversationRead',
      'messageSent',
      'messageError'
    ];

    events.forEach(event => {
      this.socket.on(event, (data) => {
        this.notifyListeners(event, data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  notifyListeners(event, data) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  emit(event, data) {
    this.socket?.emit(event, data);
  }

  sendMessage(data) {
    this.emit('sendMessage', data);
  }

  joinConversation(conversationId) {
    this.emit('joinConversation', conversationId);
  }

  leaveConversation(conversationId) {
    this.emit('leaveConversation', conversationId);
  }

  typing(conversationId, receiverId) {
    this.emit('typing', { conversationId, receiverId });
  }

  stopTyping(conversationId, receiverId) {
    this.emit('stopTyping', { conversationId, receiverId });
  }

  messageRead(messageId, conversationId, senderId) {
    this.emit('messageRead', { messageId, conversationId, senderId });
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
export default socketService;