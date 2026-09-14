import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Register = () => {
  const { register, verifyOtp, error: authError, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(Boolean(location.state?.requireOtp));
  const [otpEmail, setOtpEmail] = useState(location.state?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'All fields are required';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      return 'Please provide a valid email';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError('');

    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLoading(true);
    const result = await register(formData);
    if (result.success) {
      if (result.requireOtp) {
        setOtpSent(true);
        setOtpEmail(result.email || formData.email.toLowerCase().trim());
        setInfoMessage(result.message || 'We sent a 6-digit verification code to your email.');
        setResendCooldown(60);
      } else {
        navigate('/');
      }
    } else {
      setLocalError(result.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError('');

    const trimmedOtp = otpCode.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setLocalError('Please enter the complete 6-digit verification code');
      return;
    }

    setOtpLoading(true);
    const result = await verifyOtp(otpEmail, trimmedOtp);
    if (result.success) {
      navigate('/');
    } else {
      setLocalError(result.message);
    }
    setOtpLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setLocalError('');
    setError('');
    setResendLoading(true);
    try {
      const response = await authAPI.resendOtp(otpEmail);
      setInfoMessage(response.data.message || 'A new verification code has been sent!');
      setResendCooldown(60);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {otpSent ? (
          /* OTP Verification Form */
          <div>
            <div className="auth-header">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}
              >
                ✉️
              </div>
              <h1>Verify Your Email</h1>
              <p>
                We sent a 6-digit code to{' '}
                <strong style={{ color: 'var(--primary, #2563eb)' }}>{otpEmail}</strong>
              </p>
            </div>

            {infoMessage && (
              <div
                style={{
                  background: 'rgba(37, 99, 235, 0.08)',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary, #1e293b)'
                }}
              >
                {infoMessage}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <ErrorMessage message={localError || authError} onDismiss={() => setLocalError('')} />

              <div className="form-group">
                <label htmlFor="otpCode" style={{ textAlign: 'center', display: 'block', fontWeight: '600' }}>
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  id="otpCode"
                  name="otpCode"
                  className="input"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  autoComplete="one-time-code"
                  autoFocus
                  disabled={otpLoading}
                  style={{
                    textAlign: 'center',
                    fontSize: '1.75rem',
                    letterSpacing: '0.4em',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    padding: '10px'
                  }}
                />
                <span
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted, #64748b)',
                    marginTop: '6px'
                  }}
                >
                  Code expires in 10 minutes. Please check your spam folder if not found.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={otpLoading || otpCode.length !== 6}
                style={{ marginTop: '10px' }}
              >
                {otpLoading ? 'Verifying...' : 'Verify & Complete'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? 'var(--text-muted, #64748b)' : 'var(--primary, #2563eb)',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  padding: '6px 12px'
                }}
              >
                {resendLoading
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Didn\'t receive code? Resend'}
              </button>
            </div>

            <p className="auth-footer" style={{ marginTop: '16px' }}>
              Entered wrong email?{' '}
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode('');
                  setLocalError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary, #2563eb)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Change details
              </button>
            </p>
          </div>
        ) : (
          /* Normal Registration Form */
          <div>
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Join the conversation</p>
            </div>
            <form onSubmit={handleSubmit} className="auth-form">
              <ErrorMessage message={localError || authError} onDismiss={() => setLocalError('')} />
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="input"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 6 characters)"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', color: 'var(--text-muted, #64748b)' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e2e8f0)' }}></div>
              <span style={{ padding: '0 10px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e2e8f0)' }}></div>
            </div>

            <GoogleAuthButton onError={(msg) => setLocalError(msg)} />

            <p className="auth-footer" style={{ marginTop: '20px' }}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;