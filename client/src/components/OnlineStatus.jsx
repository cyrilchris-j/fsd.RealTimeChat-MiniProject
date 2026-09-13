import { formatLastSeen } from '../utils/helpers';

const OnlineStatus = ({ isOnline, lastSeen, className = '' }) => {
  if (isOnline) {
    return (
      <span className={`online-status-badge online ${className}`}>
        <span className="status-dot online" />
        <span>Online</span>
      </span>
    );
  }

  const lastSeenText = formatLastSeen(lastSeen);

  return (
    <span className={`online-status-badge offline ${className}`}>
      <span className="status-dot offline" />
      <span>{lastSeenText}</span>
    </span>
  );
};

export default OnlineStatus;