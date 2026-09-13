import { useState, useRef, useEffect } from 'react';
import { generateTempId } from '../utils/helpers';

const MessageInput = ({ onSend, onTyping, onStopTyping, disabled, conversationId, receiverId }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (onTyping) {
      onTyping(conversationId, receiverId);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) {
        onStopTyping(conversationId, receiverId);
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    const tempId = generateTempId();
    onSend({ text: text.trim(), tempId, conversationId, receiverId });
    setText('');
    if (onStopTyping) {
      onStopTyping(conversationId, receiverId);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className="message-input"
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        style={{ height: 'auto', minHeight: '44px', maxHeight: '120px' }}
      />
      <button
        type="submit"
        className="btn btn-primary send-button"
        disabled={!text.trim() || disabled}
        aria-label="Send message"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  );
};

export default MessageInput;