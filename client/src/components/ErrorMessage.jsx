const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="error-message" role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss error">
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;