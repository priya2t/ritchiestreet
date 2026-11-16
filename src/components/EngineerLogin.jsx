import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../api/Layout';
import { engineerLogin, setEngineerToken, getEngineerToken } from '../api/sn-engineer';
import './EngineerAuth.css';

const EngineerLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Already authenticated? Go straight to the dashboard — it validates
  // the token and sends the user back here only if the session is dead.
  useEffect(() => {
    if (getEngineerToken()) {
      navigate('/engineer-dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter your email/username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await engineerLogin(identifier.trim(), password);
      if (res.success && res.token) {
        setEngineerToken(res.token);
        navigate('/engineer-dashboard');
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Engineer Login - Ritchie Street"
      description="Log in to your Ritchie Street service engineer dashboard."
    >
      <div className="sna-auth-page">
        <div className="sna-auth-card">
          <h1>Engineer Login</h1>
          <p className="sna-auth-sub">
            Access your service engineer dashboard. Accounts are activated by our team
            after registration approval.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="sna-auth-field">
              <label htmlFor="sna-email">Email or Username</label>
              <input
                id="sna-email"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
              />
            </div>
            <div className="sna-auth-field">
              <label htmlFor="sna-pass">Password</label>
              <input
                id="sna-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

            {error && <div className="sna-auth-error">{error}</div>}

            <button type="submit" className="sna-auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="sna-auth-links">
            <p>
              Not registered yet?{' '}
              <Link to="/service-engineer-registration">Register as a Service Engineer</Link>
            </p>
            <p>
              <Link to="/">&larr; Back to Ritchie Street</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EngineerLogin;
