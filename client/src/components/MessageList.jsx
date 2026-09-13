import { useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import LoadingSpinner from './LoadingSpinner';
import { formatDate } from '../utils/helpers';

const MessageList = ({ messages, currentUserId, loading, hasMore, loadMore, typingUser, onScroll }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousMessagesLength = useRef(messages.length);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > previousMessagesLength.current) {
      scrollToBottom();
    }
    previousMessagesLength.current = messages.length;
  }, [messages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop === 0 && hasMore && !loading) {
      onScroll?.();
    }
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="message-list" ref={messagesContainerRef} onScroll={handleScroll}>
      {loading && messages.length === 0 && (
        <div className="message-list-loading">
          <LoadingSpinner />
        </div>
      )}
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={date} className="message-group">
          <div className="message-date-separator">
            <span>{date}</span>
          </div>
          {dayMessages.map(message => (
            <MessageBubble
              key={message._id}
              message={message}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ))}
      {typingUser && (
        <TypingIndicator userName={typingUser.name} />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;