import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Login = () => {
  const { login, error: authError, setError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError('');

    if (!formData.email || !formData.password) {
      setLocalError('Email and password are required');
      return;
    }

    setLoading(true);
    const result = await login(formData);
    if (result.success) {
      navigate('/');
    } else if (result.requireOtp) {
      navigate('/register', {
        state: {
          requireOtp: true,
          email: result.email,
          message: result.message
        }
      });
    } else {
      setLocalError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue chatting</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <ErrorMessage message={localError || authError} onDismiss={() => setLocalError('')} />
          <div className="form-group">
            <label htmlFor="email">Email or Username</label>
            <input
              type="text"
              id="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email or username"
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary, #2563eb)', textDecoration: 'none', fontWeight: '500' }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', color: 'var(--text-muted, #64748b)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e2e8f0)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e2e8f0)' }}></div>
        </div>

        <GoogleAuthButton onError={(msg) => setLocalError(msg)} />

        <p className="auth-footer" style={{ marginTop: '20px' }}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;