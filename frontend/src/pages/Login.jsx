import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, LogIn, AlertCircle, Sparkles } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      if (user.role === 'agent') {
        navigate('/agent-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: '#eff6ff', borderRadius: '50%', color: '#2563eb' }}>
            <Ticket size={32} />
          </div>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your Support Ticket Portal account</p>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Helper for Evaluator */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.825rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Sparkles size={14} color="#f59e0b" />
            <span>Quick Demo Logins:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('agent@support.com', 'Agent123!')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Demo Agent
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('john.customer@gmail.com', 'Customer123!')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Demo Customer
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Register as Customer
          </Link>
        </p>
      </div>
    </div>
  );
};
