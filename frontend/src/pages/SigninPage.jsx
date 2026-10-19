import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignupPage.css'; // Reusing base styles from SignupPage.css

const SigninPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/products');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Sign In</h1>
            <p>Welcome back to ShopHub</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success" style={{
            background: '#f0fff4',
            color: 'var(--success-color)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--success-color)',
            marginBottom: 'var(--spacing-lg)',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div className="auth-options">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" title="Forgot Password?" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <footer className="auth-footer">
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
