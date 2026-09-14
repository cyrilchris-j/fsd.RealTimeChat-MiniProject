import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetData, setResetData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please provide a valid email');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(email.trim());
      setResetData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to recover your account</p>
        </div>

        {resetData ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px'
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
              Reset Link Ready
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Your secure password reset verification has been generated for <strong>{email}</strong>.
            </p>
            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate(resetData.resetUrl || `/reset-password/${resetData.resetToken}`)}
              style={{ marginBottom: '14px' }}
            >
              Set New Password
            </button>
            <p className="auth-footer" style={{ marginTop: '8px' }}>
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <ErrorMessage message={error} onDismiss={() => setError('')} />
              <div className="form-group">
                <label htmlFor="email">Registered Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  autoComplete="email"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </form>
            <p className="auth-footer">
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
