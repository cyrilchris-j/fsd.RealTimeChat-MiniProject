import { useEffect, useRef, useCallback, useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import EmptyChat from './EmptyChat';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { conversationAPI, messageAPI } from '../services/api';

const ChatWindow = ({ selectedUser, conversations, onBack, onConversationCreated }) => {
  const { user: currentUser } = useAuth();
  const {
    connected,
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
    onUserStoppedTyping
  } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [typingUser, setTypingUser] = useState(null);
  const conversationIdRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const fetchMessages = useCallback(async (convId, pageNum = 1, append = false) => {
    if (!convId) return;
    setLoading(true);
    try {
      const response = await messageAPI.getMessages(convId, pageNum);
      const fetched = response.data.messages || [];
      if (append) {
        setMessages(prev => [...fetched, ...prev]);
      } else {
        setMessages(fetched);
      }
      setHasMore(pageNum < (response.data.totalPages || 1));
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && conversationIdRef.current) {
      fetchMessages(conversationIdRef.current, page + 1, true);
    }
  }, [loading, hasMore, page, fetchMessages]);

  // Load or create conversation when selectedUser changes
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      conversationIdRef.current = null;
      return;
    }

    let isSubscribed = true;

    const initConversation = async () => {
      // Find existing conversation in props
      const existingConv = conversations.find(c => {
        const participantId = c.participant?._id?.toString();
        return participantId === selectedUser._id.toString();
      });

      let activeConvId = existingConv?._id;

      if (!activeConvId) {
        try {
          const res = await conversationAPI.createConversation(selectedUser._id);
          if (!isSubscribed) return;
          activeConvId = res.data._id;
          if (onConversationCreated) {
            onConversationCreated(res.data);
          }
        } catch (err) {
          console.error('Error creating conversation:', err);
        }
      }

      if (isSubscribed && activeConvId) {
        conversationIdRef.current = activeConvId.toString();
        joinConversation(activeConvId.toString());
        fetchMessages(activeConvId.toString(), 1, false);
      }
    };

    initConversation();

    return () => {
      isSubscribed = false;
      if (conversationIdRef.current) {
        leaveConversation(conversationIdRef.current);
        conversationIdRef.current = null;
      }
      setTypingUser(null);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedUser?._id, joinConversation, leaveConversation, fetchMessages]);

  // Socket event listeners for messages & status
  useEffect(() => {
    const unsubReceive = onMessage((message) => {
      const msgConvId = (message.conversationId?._id || message.conversationId)?.toString();
      const currentConvId = conversationIdRef.current?.toString();
      const msgSenderId = (message.sender?._id || message.sender)?.toString();
      const activeUserId = selectedUserRef.current?._id?.toString();

      // Check if message belongs to current chat
      if ((msgConvId && currentConvId && msgConvId === currentConvId) || (msgSenderId && activeUserId && msgSenderId === activeUserId)) {
        if (!conversationIdRef.current && msgConvId) {
          conversationIdRef.current = msgConvId;
        }

        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });

        // Notify server that message was read
        messageRead(message._id, msgConvId || currentConvId, msgSenderId);
      }
    });

    const unsubSent = onMessageSent(({ tempId, message }) => {
      const msgConvId = (message.conversationId?._id || message.conversationId)?.toString();
      if (!conversationIdRef.current && msgConvId) {
        conversationIdRef.current = msgConvId;
      }

      setMessages(prev => {
        // Remove optimistic temp message if present
        const filtered = tempId ? prev.filter(m => m._id !== tempId) : prev;
        if (filtered.some(m => m._id === message._id)) return filtered;
        return [...filtered, message];
      });
    });

    const unsubDelivered = onMessageDelivered(({ messageId }) => {
      setMessages(prev => prev.map(m =>
        m._id === messageId && m.status !== 'read' ? { ...m, status: 'delivered' } : m
      ));
    });

    const unsubRead = onMessageRead(({ messageId }) => {
      setMessages(prev => prev.map(m =>
        m._id === messageId ? { ...m, status: 'read' } : m
      ));
    });

    const unsubConvRead = onConversationRead?.(({ conversationId, readerId }) => {
      const currentConvId = conversationIdRef.current?.toString();
      if (conversationId?.toString() === currentConvId) {
        setMessages(prev => prev.map(m =>
          (m.sender?._id || m.sender)?.toString() === currentUser._id?.toString()
            ? { ...m, status: 'read' }
            : m
        ));
      }
    });

    const unsubTyping = onUserTyping?.(({ conversationId, senderId }) => {
      const activeUserId = selectedUserRef.current?._id?.toString();
      if (senderId?.toString() === activeUserId) {
        setTypingUser(selectedUserRef.current);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      }
    });

    const unsubStopTyping = onUserStoppedTyping?.(({ conversationId, senderId }) => {
      const activeUserId = selectedUserRef.current?._id?.toString();
      if (senderId?.toString() === activeUserId) {
        setTypingUser(null);
      }
    });

    return () => {
      unsubReceive?.();
      unsubSent?.();
      unsubDelivered?.();
      unsubRead?.();
      unsubConvRead?.();
      unsubTyping?.();
      unsubStopTyping?.();
    };
  }, [onMessage, onMessageSent, onMessageDelivered, onMessageRead, onConversationRead, onUserTyping, onUserStoppedTyping, messageRead, currentUser._id]);

  const handleSend = useCallback(({ text, tempId, conversationId, receiverId }) => {
    const convId = conversationId || conversationIdRef.current;

    // Optimistically add message to UI
    const optimisticMessage = {
      _id: tempId,
      sender: {
        _id: currentUser._id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar
      },
      receiver: receiverId,
      conversationId: convId,
      text,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);

    sendMessage({
      receiverId,
      text,
      conversationId: convId,
      tempId
    });
  }, [sendMessage, currentUser]);

  const handleTyping = useCallback((convId, receiverId) => {
    typing(convId || conversationIdRef.current, receiverId);
  }, [typing]);

  const handleStopTyping = useCallback((convId, receiverId) => {
    stopTyping(convId || conversationIdRef.current, receiverId);
  }, [stopTyping]);

  if (!selectedUser) {
    return <EmptyChat />;
  }

  return (
    <div className="chat-window">
      <ChatHeader participant={selectedUser} onBack={onBack} />
      <MessageList
        messages={messages}
        currentUserId={currentUser._id}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        typingUser={typingUser}
        onScroll={loadMore}
      />
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        disabled={!connected}
        conversationId={conversationIdRef.current}
        receiverId={selectedUser._id}
      />
    </div>
  );
};

export default ChatWindow;