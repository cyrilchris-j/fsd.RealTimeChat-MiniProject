import OnlineStatus from './OnlineStatus';
import { useSocket } from '../context/SocketContext';
import { getInitials } from '../utils/helpers';

const ChatHeader = ({ participant, onBack }) => {
  const { isOnline, getLastSeen } = useSocket();
  if (!participant) return null;

  const online = isOnline(participant._id);
  const lastSeenTime = getLastSeen(participant._id, participant.lastSeen);
  const initials = getInitials(participant.name);
  const avatarColor = `hsl(${participant.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 70%, 50%)`;

  return (
    <header className="chat-header">
      {onBack && (
        <button className="chat-back-btn" onClick={onBack} aria-label="Back to users">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <div className="chat-header-avatar-container">
        <div className="user-avatar" style={{ backgroundColor: avatarColor }}>
          {participant.avatar ? (
            <img src={participant.avatar} alt={participant.name} />
          ) : (
            initials
          )}
        </div>
        <span className={`avatar-status-badge ${online ? 'online' : 'offline'}`} />
      </div>
      <div className="chat-header-info">
        <h2 className="chat-header-name">{participant.name}</h2>
        <OnlineStatus isOnline={online} lastSeen={lastSeenTime} />
      </div>
    </header>
  );
};

export default ChatHeader;