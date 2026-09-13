import OnlineStatus from './OnlineStatus';
import { getInitials } from '../utils/helpers';
import { useSocket } from '../context/SocketContext';

const UserListItem = ({ user, isSelected, onClick, lastMessage, showStatus = true }) => {
  const { isOnline, getLastSeen } = useSocket();
  const initials = getInitials(user.name);
  const avatarColor = `hsl(${user.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 70%, 50%)`;

  const online = isOnline(user._id);
  const lastSeenTime = getLastSeen(user._id, user.lastSeen);

  return (
    <button
      className={`user-list-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(user)}
      type="button"
    >
      <div className="user-avatar-container">
        <div className="user-avatar" style={{ backgroundColor: avatarColor }}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            initials
          )}
        </div>
        <span className={`avatar-status-badge ${online ? 'online' : 'offline'}`} />
      </div>
      <div className="user-info">
        <div className="user-name-row">
          <span className="user-name">{user.name}</span>
          {showStatus && <OnlineStatus isOnline={online} lastSeen={lastSeenTime} />}
        </div>
        <div className="user-sub-row">
          <span className="user-username">@{user.username}</span>
          {lastMessage && (
            <span className="user-last-message">
              {lastMessage.text}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default UserListItem;