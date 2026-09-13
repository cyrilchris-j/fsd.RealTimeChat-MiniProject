const TypingIndicator = ({ userName }) => {
  return (
    <div className="typing-indicator">
      <span>{userName} is typing</span>
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default TypingIndicator;