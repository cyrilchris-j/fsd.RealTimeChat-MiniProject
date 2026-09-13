const EmptyChat = ({ participant }) => {
  if (participant) {
    return (
      <div className="empty-chat">
        <div className="empty-chat-avatar">
          <div className="user-avatar-large" style={{ backgroundColor: `hsl(${participant.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)}deg, 70%, 50%)` }}>
            {participant.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <h3>Start a conversation with {participant.name}</h3>
        <p>Send a message to begin chatting</p>
      </div>
    );
  }

  return (
    <div className="empty-chat">
      <div className="empty-chat-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3>Welcome to Chat App</h3>
      <p>Select a user from the sidebar to start messaging</p>
    </div>
  );
};

export default EmptyChat;