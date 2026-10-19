import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignupPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      // The response likely contains the userId for the reset link
      // Or we might need to inform the user to check their email
      setSuccess('If an account exists with that email, we have sent a password reset link.');

      // If the backend returns the userId (for demonstration/easy testing), 
      // we could redirect to reset page. In a real app, it would be an email link.
      // Assuming response.id is the userId if it's returns for convenience in this project
      if (response && response.id) {
        setTimeout(() => {
          navigate(`/reset-password/${response.id}`);
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Forgot Password</h1>
            <p>Enter your email to reset your password</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending Request...' : 'Reset Password'}
            </button>
          </form>

          <footer className="auth-footer">
            Remembered your password? <Link to="/signin">Sign In</Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
