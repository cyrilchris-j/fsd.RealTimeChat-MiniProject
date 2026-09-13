import { formatTime } from '../utils/helpers';

const MessageBubble = ({ message, currentUserId, showStatus = true }) => {
  const senderId = message.sender?._id?.toString() || message.sender?.toString();
  const isSent = senderId === currentUserId?.toString();

  const renderStatus = () => {
    if (!isSent || !showStatus) return null;

    if (message.status === 'read') {
      return (
        <span className="message-status status-read" title="Read">
          ✓✓
        </span>
      );
    }
    if (message.status === 'delivered') {
      return (
        <span className="message-status status-delivered" title="Delivered">
          ✓✓
        </span>
      );
    }
    return (
      <span className="message-status status-sent" title="Sent">
        ✓
      </span>
    );
  };

  return (
    <div className={`message-bubble-row ${isSent ? 'sent' : 'received'}`}>
      <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
        {!isSent && message.sender?.name && (
          <span className="sender-name">{message.sender.name}</span>
        )}
        <div className="message-content">
          <p className="message-text">{message.text}</p>
          <div className="message-meta">
            <span className="message-time">{formatTime(message.createdAt || new Date())}</span>
            {renderStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;