import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Map());

  useEffect(() => {
    if (user && !authLoading) {
      const token = localStorage.getItem('token');
      if (!token) return;

      const socket = socketService.connect(token);

      const handleConnect = () => setConnected(true);
      const handleDisconnect = () => setConnected(false);

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      if (socket.connected) {
        setConnected(true);
      }

      // Initial list of online users from server
      const unsubscribeOnlineUsers = socketService.on('onlineUsers', (userIds) => {
        if (Array.isArray(userIds)) {
          setOnlineUsers(new Set(userIds.map(id => id.toString())));
        }
      });

      // Real-time online/offline updates
      const unsubscribeUserStatus = socketService.on('userStatus', ({ userId, isOnline, lastSeen }) => {
        const idStr = userId?.toString();
        setOnlineUsers(prev => {
          const next = new Set(prev);
          if (isOnline) {
            next.add(idStr);
          } else {
            next.delete(idStr);
          }
          return next;
        });

        if (lastSeen) {
          setLastSeenMap(prev => {
            const next = new Map(prev);
            next.set(idStr, lastSeen);
            return next;
          });
        }
      });

      // Typing indicators
      const unsubscribeTyping = socketService.on('userTyping', ({ conversationId, senderId }) => {
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.set(`${senderId}`, true);
          if (conversationId) next.set(`${conversationId}-${senderId}`, true);
          return next;
        });
      });

      const unsubscribeStopTyping = socketService.on('userStoppedTyping', ({ conversationId, senderId }) => {
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.delete(`${senderId}`);
          if (conversationId) next.delete(`${conversationId}-${senderId}`);
          return next;
        });
      });

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        unsubscribeOnlineUsers();
        unsubscribeUserStatus();
        unsubscribeTyping();
        unsubscribeStopTyping();
      };
    } else if (!user) {
      socketService.disconnect();
      setConnected(false);
      setOnlineUsers(new Set());
    }
  }, [user, authLoading]);

  const isOnline = useCallback((userId) => {
    if (!userId) return false;
    return onlineUsers.has(userId.toString());
  }, [onlineUsers]);

  const getLastSeen = useCallback((userId, fallbackDate) => {
    if (!userId) return fallbackDate;
    return lastSeenMap.get(userId.toString()) || fallbackDate;
  }, [lastSeenMap]);

  const isTyping = useCallback((conversationId, userId) => {
    if (!userId) return false;
    if (conversationId && typingUsers.has(`${conversationId}-${userId}`)) return true;
    return typingUsers.has(`${userId}`);
  }, [typingUsers]);

  const sendMessage = useCallback((data) => {
    socketService.sendMessage(data);
  }, []);

  const joinConversation = useCallback((conversationId) => {
    socketService.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    socketService.leaveConversation(conversationId);
  }, []);

  const typing = useCallback((conversationId, receiverId) => {
    socketService.typing(conversationId, receiverId);
  }, []);

  const stopTyping = useCallback((conversationId, receiverId) => {
    socketService.stopTyping(conversationId, receiverId);
  }, []);

  const messageRead = useCallback((messageId, conversationId, senderId) => {
    socketService.messageRead(messageId, conversationId, senderId);
  }, []);

  const onMessage = useCallback((callback) => {
    return socketService.on('receiveMessage', callback);
  }, []);

  const onMessageSent = useCallback((callback) => {
    return socketService.on('messageSent', callback);
  }, []);

  const onMessageDelivered = useCallback((callback) => {
    return socketService.on('messageDelivered', callback);
  }, []);

  const onMessageRead = useCallback((callback) => {
    return socketService.on('messageRead', callback);
  }, []);

  const onConversationRead = useCallback((callback) => {
    return socketService.on('conversationRead', callback);
  }, []);

  const onUserTyping = useCallback((callback) => {
    return socketService.on('userTyping', callback);
  }, []);

  const onUserStoppedTyping = useCallback((callback) => {
    return socketService.on('userStoppedTyping', callback);
  }, []);

  const onMessageError = useCallback((callback) => {
    return socketService.on('messageError', callback);
  }, []);

  return (
    <SocketContext.Provider value={{
      connected,
      onlineUsers,
      isOnline,
      getLastSeen,
      isTyping,
      sendMessage,
      joinConversation,
      leaveConversation,
      typing,
      stopTyping,
      messageRead,
      onMessage,
      onMessageSent,
      onMessageDelivered,
      onMessageRead,
      onConversationRead,
      onUserTyping,
      onUserStoppedTyping,
      onMessageError
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};