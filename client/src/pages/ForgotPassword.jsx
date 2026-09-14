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
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--primary, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px'
              }}
            >
              ✉️
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
              Check Your Email Inbox
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '20px' }}>
              We have sent a secure password reset link to:
              <br />
              <strong style={{ color: 'var(--text-main)', display: 'inline-block', marginTop: '4px' }}>{email}</strong>
            </p>
            <div
              style={{
                background: 'var(--bg-app, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                color: 'var(--text-muted, #64748b)',
                textAlign: 'left',
                marginBottom: '24px',
                lineHeight: '1.4'
              }}
            >
              💡 <strong>Next Step:</strong> Open your email app or inbox and click the <strong>Reset My Password</strong> button in the email to set your new password. (The link is valid for 15 minutes).
            </div>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-full"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Open Gmail Inbox
              </a>
              <button
                type="button"
                className="btn btn-secondary btn-full"
                onClick={() => setResetData(null)}
              >
                Try another email
              </button>
            </div>
            <p className="auth-footer" style={{ marginTop: '20px' }}>
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
