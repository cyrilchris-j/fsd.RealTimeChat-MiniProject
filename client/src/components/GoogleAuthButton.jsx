import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const InnerGoogleButton = ({ onError: onAuthError }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        navigate('/');
      } else if (onAuthError) {
        onAuthError(result.message);
      }
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onAuthError && onAuthError('Google Sign-In was cancelled or failed')}
        shape="rectangular"
        size="large"
        width="100%"
        text="continue_with"
        theme="outline"
      />
    </div>
  );
};

const GoogleAuthButton = ({ onError: onAuthError }) => {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
    return (
      <button
        type="button"
        className="btn btn-full"
        onClick={() => {
          if (onAuthError) {
            onAuthError('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID in client/.env');
          } else {
            alert('Please configure VITE_GOOGLE_CLIENT_ID in client/.env to use Google Sign-In.');
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: '#ffffff',
          color: '#374151',
          border: '1px solid #d1d5db',
          fontWeight: '600',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.15s ease'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
        </svg>
        Continue with Google
      </button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <InnerGoogleButton onError={onAuthError} />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthButton;
